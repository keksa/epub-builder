$(function () {
    var $chapters = $('#chapters');
    var $chaptersSeparator = $('#chapters-separator');

    $('#files').on('input', function (e) {
        if (! $('#frm-append-chapters').is(':checked')) {
            $chapters.empty();
        }
        var fillName = $('#frm-autofill-title').is(':checked');
        var files = $(this).get(0).files;

        [...files].forEach(function (file) {
            var $li = $('<li class="list-group-item text-muted disabled"></li>');
            $li.text(file.name);
            $li.appendTo($chapters);

            if (fillName) {
                $('#frm-name').val(file.name)
                fillName = false;
            }

            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                $li.data('chapter-content', evt.target.result);
                $li.removeClass('text-muted disabled');
            }
            reader.onerror = function (evt) {
                $li.addClass('text-danger');
                $li.removeClass('text-muted');
                alert(reader.error);
            }
        });

        $(this).get(0).value = null;
        $chaptersSeparator.toggleClass('d-none', $chapters.find('.list-group-item').length === 0);
    });

    $chapters.sortable();

    $('#clear').on('click', function () {
        $(this).closest('form').get(0).reset();
        localStorage.setItem($('#frm-name').attr('id'), '');
        localStorage.setItem($('#frm-tags').attr('id'), '');
        $('#frm-author').val(localStorage.getItem('frm-author'));
        $chapters.empty();
        $chaptersSeparator.addClass('d-none');
    });

    $('#frm-name, #frm-author, #frm-tags').each(function () {
        $(this).val(localStorage.getItem($(this).attr('id')));
    });
    $('#frm-name, #frm-author, #frm-tags').on('input', function () {
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