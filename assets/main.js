$(function() {
    var $chapters = $('#chapters');

    $('#files').on('input', function (e) {
        $chapters.empty();
        var files = $(this).get(0).files;
        
        [...files].forEach(function (file) {
            var $li = $('<li class="list-group-item text-muted disabled"></li>');
            $li.text(file.name);
            $li.appendTo($chapters);

            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                $li.data('chapter-content', evt.target.result);
                $li.removeClass('text-muted disabled');
            }
            reader.onerror  = function (evt) {
                $li.addClass('text-danger');
                $li.removeClass('text-muted');
                alert(reader.error);
            }
        });

        $(this).get(0).value = null;
    });

    $chapters.sortable();

    $('#clear').on('click', function () {
        $(this).closest('form').get(0).reset();
        localStorage.setItem($('#frm-name').attr('id'), '');
        $('#frm-author').val(localStorage.getItem('frm-author'));
        $chapters.empty();
    });

    $('#frm-name, #frm-author').each(function () {
        $(this).val(localStorage.getItem($(this).attr('id')));
    });
    $('#frm-name, #frm-author').on('input', function () {
        localStorage.setItem($(this).attr('id'), $(this).val());
    });

    var $generateBtn = $('#generate');

    var generate = function () {
        $generateBtn.prop('disabled', true);
        var title = $('#frm-name').val();
        var author = $('#frm-author').val();
        var tags = $('#frm-tags').val().split(',').map(element => {
          return element.trim();
        });

        const jepub = new jEpub();
          jepub.init({
            i18n: 'en',
            title: title,
            author: author,
            publisher: false,
            tags: tags,
          });

          var chapterCount = 1;
        $chapters.find('.list-group-item').each(function () {
            var $ch = $(this);
            jepub.add(`Chapter ${chapterCount}`, $ch.data('chapter-content'));
            chapterCount++;
        });

        
      jepub.generate().then(filecontent => {
        const url = URL.createObjectURL(filecontent),
            filename = `${author} - ${title}.epub`;

        saveAs(filecontent, filename);
        $generateBtn.prop('disabled', false);
      }).catch(err => {
        $generateBtn.prop('disabled', false);
      });
    };

    $('#epub-form').on('submit', function () {
        generate();

        return false;
    });
});