var FootnotesShs = (function () {
    function FootnotesShs() {
        this.partsOfNoteIds = ['_ftn'];
        this.footnotes = {};
        this.hideDist = 100;
        this.startHide = 20;
        this.bindFuncRef = this.checkDistanceAndHide.bind(this);
        this.initWidth = 200;
        var that = this;
        this.popupWindow = document.createElement('div');
        this.popupWindow.className = 'shs-footnote-popup';
        this.popupWindowText = document.createElement('container');
        this.popupWindow.appendChild(this.popupWindowText);
        this.popupWindow.style.cssText = 'position: absolute; z-index: 99; background-color:' +
            ' #fff; color: #000; border: 1px solid #8b8a8a; border-radius: 6px; padding: 5px 10px;' +
            ' box-shadow: 5px 5px 10px 2px #c8c8c8;display:none;overflow-y:auto;';
        document.querySelector('body').appendChild(that.popupWindow);
        this.maxHeight = Math.round(window.innerHeight / 2);
        this.maxWidth = Math.round(window.innerWidth / 2);
        this.popupWindow.style.maxHeight = this.maxHeight + 'px';
        this.popupWindow.style.width = this.initWidth + 'px';
        this.detect();
        this.bind();
    }
    FootnotesShs.prototype.detect = function () {
        var that = this;
        this.partsOfNoteIds.forEach(function (part) {
            var anchors = document.querySelectorAll('[id*="' + part + '"]');
            for (var key = 0; key < anchors.length; key++) {
                var anchorParagraph = anchors[key].parentElement;
                var id = anchors[key].id;
                that.footnotes[id] = anchorParagraph.innerHTML + that.getSiblings(anchorParagraph);
            }
        });
    };
    FootnotesShs.prototype.getSiblings = function (element) {
        var html = '';
        var brother = element.nextElementSibling;
        if (brother &&
            brother.tagName === 'P' &&
            !this.isFirstParagraphOfNote(brother)) {
            html += '<p>' + brother.innerHTML + '</p>';
            html += this.getSiblings(brother);
        }
        return html;
    };
    FootnotesShs.prototype.isFirstParagraphOfNote = function (element) {
        var isFirst = false;
        if (element.children.length == 0)
            return false;
        this.partsOfNoteIds.forEach(function (part) {
            if (element.children[0].id.indexOf(part) !== -1) {
                isFirst = true;
            }
        });
        return isFirst;
    };
    FootnotesShs.prototype.showPopup = function (event) {
        this.resetWindow();
        var href = event.target.attributes['href'].nodeValue;
        var hrefId = href.substring(1, href.length);
        var footNoteHtml = this.footnotes[hrefId];
        this.popupWindowText.innerHTML = footNoteHtml;
        this.popupWindow.style.display = 'block';
        this.setOptimalWidth();
        var offsetY = event.pageY - event.clientY;
        this.popupWindow.style.top = Math.max(event.clientY - this.popupWindow.clientHeight, 0) + offsetY + 'px';
        this.popupWindow.style.left = Math.min(event.clientX + 10, screen.width - this.popupWindow.clientWidth - 40) + 'px';
        document.addEventListener('mousemove', this.bindFuncRef);
    };
    FootnotesShs.prototype.resetWindow = function () {
        this.popupWindow.style.opacity = '1';
        this.popupWindow.style.display = 'none';
        this.popupWindow.style.width = this.initWidth + 'px';
    };
    FootnotesShs.prototype.setOptimalWidth = function () {
        var rectText = this.popupWindowText.getBoundingClientRect();
        var height = rectText.height;
        var rectWindow = this.popupWindow.getBoundingClientRect();
        var width = rectWindow.width;
        if (height < width)
            return;
        var k = height / width;
        this.popupWindow.style.width = Math.min(width * k, this.maxWidth) + 'px';
    };
    FootnotesShs.prototype.checkDistanceAndHide = function (event) {
        var px = event.clientX;
        var py = event.clientY;
        var rect = this.popupWindow.getBoundingClientRect();
        var height = rect.height;
        var width = rect.width;
        var rx = rect.left + width / 2;
        var ry = rect.top + height / 2;
        height = height + this.startHide * 2;
        width = width + this.startHide * 2;
        var dx = Math.max(Math.abs(px - rx) - width / 2, 0);
        var dy = Math.max(Math.abs(py - ry) - height / 2, 0);
        var dist = Math.sqrt(dx * dx + dy * dy);
        var opacity = 1 - dist / this.hideDist;
        if (opacity > 0) {
            this.popupWindow.style.opacity = opacity.toString();
        }
        else {
            this.resetWindow();
            document.removeEventListener('mousemove', this.bindFuncRef);
        }
    };
    FootnotesShs.prototype.bind = function () {
        var elements = document.querySelectorAll('a');
        for (var i = 0; i < elements.length; i++) {
            if (!elements[i].attributes['href'])
                continue;
            var href = elements[i].attributes['href'].nodeValue;
            if (href.indexOf('#') !== 0)
                continue;
            var hrefId = href.substring(1, href.length);
            if (this.footnotes[hrefId]) {
                elements[i].addEventListener('mouseenter', this.showPopup.bind(this));
            }
        }
    };
    return FootnotesShs;
}());
document.addEventListener('DOMContentLoaded', function () {
    var footNotes = new FootnotesShs();
});
