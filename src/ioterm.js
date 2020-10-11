
class IOTerm {

  constructor(id, options) {
    
    options = options || {}
    const cursor = '<span class="cursor">&#x258d;</span>';
  
    const e = document.getElementById(id);
    e.setAttribute('tabindex', '0');
    e.style['overflow-y'] = 'scroll';
    e.style['outline'] = 'none';

    this.element = e;
    // need to handle this
    this.history = []
    this.index = null;    // index of where we are in the history
    
    // alternative representation: editBefore, editAfter, with cursor always at the first elt of editAfter

    e.addEventListener('keydown', evt => { 
      evt.preventDefault();
      var e = this.element.querySelector('.prompt');
      if (e) { 
        this.element.scrollTop = this.element.scrollHeight;
        if (evt.key === 'Enter') {
          if (this.index > 0) {
            // we're not on the current input, so copy to current input 
            this.history[0].edit = this.history[this.index].edit;
            // then restore original at the history point
            this.history[this.index].edit = this.history[this.index].original;
            this.index = 0;
          }
          // strip off the terminating space...
          var input = this.history[this.index].edit.slice(0, this.history[this.index].edit.length - 1);
          var callback = this.promptCallback;
          this.disablePrompt();
          if (callback) { return callback(input); } 
        }
        else if (evt.key === 'Backspace') {
          if (this.position > 0) { 
            //var len = this.history[this.index].edit.length;
            //this.history[this.index].edit = this.history[this.index].edit.slice(0, len - 1);
            this.history[this.index].edit = this.history[this.index].edit.slice(0, this.position - 1) +
              this.history[this.index].edit.slice(this.position);
            this.position--;
            this.updateLine(e);
          }
        }
        else if ((evt.ctrlKey && evt.key.toLowerCase() === 'p') || evt.key === 'ArrowUp') {
          if (this.index < this.history.length - 1) { 
            this.index++;
            this.position = this.history[this.index].edit.length - 1;   
            this.updateLine(e);
          }
        }
        else if ((evt.ctrlKey && evt.key.toLowerCase() === 'n') || evt.key === 'ArrowDown') {
          if (this.index > 0) { 
            this.index--;
            this.position = this.history[this.index].edit.length - 1;
            this.updateLine(e);
          }
        }
        else if ((evt.ctrlKey && evt.key.toLowerCase() === 'b') || evt.key === 'ArrowLeft') {
          if (this.position > 0) { 
            this.position--;
            this.updateLine(e);
          }
        }
        else if ((evt.ctrlKey && evt.key.toLowerCase() === 'f') || evt.key === 'ArrowRight') {
          if (this.position < this.history[this.index].edit.length - 1) { 
            this.position++;
            this.updateLine(e);
          }
        }
        else if (evt.ctrlKey && evt.key.toLowerCase() === 'a') {
          this.position = 0;
          this.updateLine(e);
        }
        else if (evt.ctrlKey && evt.key.toLowerCase() === 'e') {
          this.position = this.history[this.index].edit.length - 1;
          this.updateLine(e);
        }
        else if (evt.ctrlKey && evt.key.toLowerCase() === 'k') {
          this.history[this.index].edit = this.history[this.index].edit.slice(0, this.position) + ' ';
          this.updateLine(e);
        }
        else if (evt.ctrlKey && evt.key.toLowerCase() === 'u') {
          this.history[this.index].edit = this.history[this.index].edit.slice(this.position);
          this.position = 0;
          this.updateLine(e);
        }
        else if (evt.ctrlKey && evt.key.toLowerCase() === 'd') {
          if (this.position < this.history[this.index].edit.length - 1) {
            // don't bother deleting if we're at the terminal space
            this.history[this.index].edit = this.history[this.index].edit.slice(0, this.position) +
              this.history[this.index].edit.slice(this.position + 1);
            this.updateLine(e);
          }
        }
        else if (evt.key.length > 1) {
          // we got a control key - skip
	  // TODO: is this safe?
          return;
        }
        else { 
          ///this.history[this.index].edit += evt.key;
          this.history[this.index].edit = this.history[this.index].edit.slice(0, this.position) + evt.key +
            this.history[this.index].edit.slice(this.position);
          this.position++;
          this.updateLine(e)
        }
      }
    });
  }

  clean (text) { 
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  updateLine (elt) {
    //elt.innerHTML = this.clean(this.promptText + this.history[this.index].edit) + cursor;
    elt.innerHTML = this.clean(this.promptText + this.history[this.index].edit.slice(0, this.position)) +
      '<span style="color: white; background: red;">' + this.clean(this.history[this.index].edit[this.position]) + '</span>' +
      this.clean(this.history[this.index].edit.slice(this.position + 1))
  }

  print (text) { 
    var p = document.createElement('p');
    p.style.whiteSpace = 'pre-wrap';
    p.style.fontFamily = 'monospace';
    p.style.margin = '0px';
    p.style.padding= '0px';
    p.innerText = text;
    this.element.appendChild(p);
    this.element.scrollTop = this.element.scrollHeight;
  }

  printHTML (text) { 
    var p = document.createElement('p');
    p.style.whiteSpace = 'pre-wrap';
    p.style.fontFamily = 'monospace';
    p.style.margin = '0px';
    p.style.padding= '0px';
    p.innerHTML = text;
    this.element.appendChild(p);
    this.element.scrollTop = this.element.scrollHeight;
  }

  disablePrompt () { 
    var e = this.element.querySelector('.prompt');
    if (e) { 
      e.innerHTML = this.clean(this.promptText + this.history[this.index].edit);
      e.classList.remove('prompt');
    }    
  }
  
  prompt (text, callback) {
    var e = this.element.querySelector('.prompt');
    if (e) {
      return;
    }
    var p = document.createElement('p');
    p.style.whiteSpace = 'pre-wrap';
    p.style.fontFamily = 'monospace';
    p.style.margin = '0px';
    p.style.padding= '0px';
    p.classList.add('prompt');
    this.element.appendChild(p);
    ///p.innerHTML = this.clean(text) + cursor;
    // save originals
    this.history.forEach(function(entry) { entry.original = entry.edit });
    ///console.log(this.history);
    if (this.history.length === 0 || this.history[0].edit != ' ') {
      // add a new entry if no history or last entry was empty
      this.history.unshift({edit: ' '});
    }
    this.index = 0;
    this.position = 0;
    this.promptText = text;
    this.updateLine(p);
    this.promptCallback = callback;
    this.element.scrollTop = this.element.scrollHeight;
    this.element.focus();
  }

  clear () { 
    while (this.element.firstChild) { 
      this.element.removeChild(this.element.firstChild);
    }
  }
}
