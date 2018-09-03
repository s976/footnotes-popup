class FootnotesShs {
    partsOfNoteIds : string[] = ['_ftn'];
    footnotes = {};
    popupWindow : HTMLElement;
    popupWindowText : HTMLElement;
    hideDist = 100;
    startHide = 20;
    private bindFuncRef = this.checkDistanceAndHide.bind(this);
    private maxHeight : number;
    private maxWidth : number;
    initWidth = 200;


    constructor(){
        let that = this;
        this.popupWindow = document.createElement('div');
        this.popupWindow.className = 'shs-footnote-popup';
        this.popupWindowText = document.createElement('container');
        this.popupWindow.appendChild(this.popupWindowText);
        this.popupWindow.style.cssText = 'position: absolute; z-index: 99; background-color:' +
            ' #fff; color: #000; border: 1px solid #8b8a8a; border-radius: 6px; padding: 5px 10px;' +
            ' box-shadow: 5px 5px 10px 2px #c8c8c8;display:none;overflow-y:auto;';
        document.querySelector('body').appendChild(that.popupWindow);
        this.maxHeight = Math.round(window.innerHeight/2);
        this.maxWidth = Math.round(window.innerWidth/2);
        this.popupWindow.style.maxHeight = this.maxHeight + 'px';
        this.popupWindow.style.width = this.initWidth + 'px';
        this.detect();
        this.bind();
    }


    detect(){
        let that = this;
        this.partsOfNoteIds.forEach(function (part) {
            let anchors = document.querySelectorAll('[id*="'+part+'"]');

           for (let key=0;key<anchors.length;key++){
               let anchorParagraph = anchors[key].parentElement;
               let id = anchors[key].id;
               that.footnotes[id] = anchorParagraph.innerHTML + that.getSiblings(anchorParagraph);
           }
        })
    }

    /**
     * Return html that continue the beginning of a note
     *
     * @param element <p> element
     */
    private getSiblings(element : Element) : string {
        let html = '';
        const brother = element.nextElementSibling;

        if ( brother && //has next
            brother.tagName==='P' && // the next element is P
            !this.isFirstParagraphOfNote(brother) //it is not a beginning of next note
        ){
            html += '<p>' + brother.innerHTML + '</p>'; //it's a continue of a note
            html += this.getSiblings(brother); //recursively add next P
        }
        return html;
    }


    /**
     * Checks if this <p> is a beginning of a footnote
     *
     * @param element
     */
    private isFirstParagraphOfNote(element : Element ) : boolean{
        let isFirst = false;
        if (element.children.length==0) return false; //First paragraph starts with a child tag
        this.partsOfNoteIds.forEach(function (part) {
          if (element.children[0].id.indexOf(part)!==-1){//First element is a A tag of note
              isFirst=true;
          }
        });
        return isFirst;
    }

    private showPopup(event){
        this.resetWindow();
        let href = event.target.attributes['href'].nodeValue;
        let hrefId = href.substring(1,href.length);
        let footNoteHtml = this.footnotes[hrefId];
        this.popupWindowText.innerHTML = footNoteHtml;
        this.popupWindow.style.display = 'block';
        this.setOptimalWidth();
        let offsetY = event.pageY - event.clientY;
        this.popupWindow.style.top = Math.max(event.clientY  - this.popupWindow.clientHeight,0) + offsetY + 'px';
        this.popupWindow.style.left =  Math.min(event.clientX + 10, screen.width-this.popupWindow.clientWidth-40) + 'px';
        document.addEventListener('mousemove',this.bindFuncRef);
    }

    private resetWindow(){
        this.popupWindow.style.opacity = '1';
        this.popupWindow.style.display = 'none';
        this.popupWindow.style.width = this.initWidth + 'px';
    }

    /**
     * Increase window width if it's too narrow
     */
    private setOptimalWidth(){
        let rectText = this.popupWindowText.getBoundingClientRect(); //not scrollable part - actual height
        let height = rectText.height;
        let rectWindow = this.popupWindow.getBoundingClientRect();
        let width = rectWindow.width;
        if (height<width) return;
        let k = height/width;
        this.popupWindow.style.width = Math.min(width*k, this.maxWidth) + 'px';
    }

    private checkDistanceAndHide(event){
        let px = event.clientX;
        let py = event.clientY;
        let rect = this.popupWindow.getBoundingClientRect();
        let height = rect.height;
        let width = rect.width;
        let rx = rect.left + width/2; //the center
        let ry = rect.top + height/2;
        height = height + this.startHide*2;
        width = width + this.startHide*2;

        //Calculate distance between a point and an axis-aligned rectangle
        let dx = Math.max(Math.abs(px - rx) - width / 2, 0);
        let dy = Math.max(Math.abs(py - ry) - height / 2, 0);
        let dist = Math.sqrt(dx * dx + dy * dy);

        let opacity = 1 - dist/this.hideDist;
        if (opacity>0){
            this.popupWindow.style.opacity = opacity.toString();
        } else {
            this.resetWindow();
            document.removeEventListener('mousemove',this.bindFuncRef);
        }
    }


    /**
     * Bind events to note links
     */
    bind(){
        let elements = document.querySelectorAll('a');
        for (let i=0;i<elements.length;i++){
            if (!elements[i].attributes['href']) continue;
            let href = elements[i].attributes['href'].nodeValue;
            if ( href.indexOf('#')!==0 ) continue;
            let hrefId = href.substring(1,href.length);
            if ( this.footnotes[hrefId]){
                elements[i].addEventListener('mouseenter',this.showPopup.bind(this));
            }
        }
    }
}


document.addEventListener('DOMContentLoaded',function () {
    const footNotes = new FootnotesShs();
});
