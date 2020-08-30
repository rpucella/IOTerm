
function ioterm (id, options) { 

  options = options || {}
  var cursor = '<span class="cursor">&#x258d;</span>';
  
  var e = document.getElementById(id);
  e.setAttribute('tabindex', '0');
  e.style['overflow-y'] = 'scroll';
  e.style['outline'] = 'none';
  e.classList.add('io');

  function clean (text) { 
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  function updateLine (that, elt) {
    //elt.innerHTML = clean(that.promptText + that.history[that.index].edit) + cursor;
    elt.innerHTML = clean(that.promptText + that.history[that.index].edit.slice(0, that.position)) +
      '<span style="color: white; background: red;">' + clean(that.history[that.index].edit[that.position]) + '</span>' +
      clean(that.history[that.index].edit.slice(that.position + 1))
  }

  function C () {

    var that = this;
    this.element = e;
    this.key_control = false;
    // need to handle this
    this.history = []
    this.index = null;    // index of where we are in the history

    // alternative representation: editBefore, editAfter, with cursor always at the first elt of editAfter

    e.addEventListener('keypress', function(evt) {
      evt.preventDefault();
    });
    
    e.addEventListener('keyup', function(evt) { 
      evt.preventDefault();
      if (evt.key === 'Control') {
        that.key_control = false;
      }
    });
    
    e.addEventListener('keydown', function(evt) { 
      evt.preventDefault();
      var e = that.element.querySelector('.prompt');
      if (e) { 
        that.element.scrollTop = that.element.scrollHeight;
        if (evt.key === 'Enter') {
          if (that.index > 0) {
            // we're not on the current input, so copy to current input 
            that.history[0].edit = that.history[that.index].edit;
            // then restore original at the history point
            that.history[that.index].edit = that.history[that.index].original;
            that.index = 0;
          }
          // strip off the terminating space...
          var input = that.history[that.index].edit.slice(0, that.history[that.index].edit.length - 1);
          var callback = that.promptCallback;
          that.disablePrompt();
          if (callback) { return callback(input); } 
        }
        else if (evt.key === 'Backspace') {
          if (that.position > 0) { 
            //var len = that.history[that.index].edit.length;
            //that.history[that.index].edit = that.history[that.index].edit.slice(0, len - 1);
            that.history[that.index].edit = that.history[that.index].edit.slice(0, that.position - 1) +
              that.history[that.index].edit.slice(that.position);
            that.position--;
            updateLine(that, e);
          }
        }
        else if (evt.key === 'Control') {
	  that.key_control = true;
        }
        else if (evt.key.length > 1) {
          // we got a control key - skip
          return;
        }
        else if (that.key_control) {
          if (evt.key.toLowerCase() === 'p') {
            if (that.index < that.history.length - 1) { 
              that.index++;
              that.position = that.history[that.index].edit.length - 1;   
              updateLine(that, e);
            }
          }
          else if (evt.key.toLowerCase() === 'n') {
            if (that.index > 0) { 
              that.index--;
              that.position = that.history[that.index].edit.length - 1;
              updateLine(that, e);
            }
          }
          else if (evt.key.toLowerCase() === 'b') {
            if (that.position > 0) { 
              that.position--;
              updateLine(that, e);
            }
          }
          else if (evt.key.toLowerCase() === 'f') {
            if (that.position < that.history[that.index].edit.length - 1) { 
              that.position++;
              updateLine(that, e);
            }
          }
          else if (evt.key.toLowerCase() === 'a') {
            that.position = 0;
            updateLine(that, e);
          }
          else if (evt.key.toLowerCase() === 'e') {
            that.position = that.history[that.index].edit.length - 1;
            updateLine(that, e);
          }
          else if (evt.key.toLowerCase() === 'k') {
            that.history[that.index].edit = that.history[that.index].edit.slice(0, that.position) + ' ';
            updateLine(that, e);
          }
          else if (evt.key.toLowerCase() === 'u') {
            that.history[that.index].edit = that.history[that.index].edit.slice(that.position);
            that.position = 0;
            updateLine(that, e);
          }
          else if (evt.key.toLowerCase() === 'd') {
            if (that.position < that.history[that.index].edit.length - 1) {
              // don't bother deleting if we're at the terminal space
              that.history[that.index].edit = that.history[that.index].edit.slice(0, that.position) +
                that.history[that.index].edit.slice(that.position + 1);
              updateLine(that, e);
            }
          }
        }
        else { 
          ///that.history[that.index].edit += evt.key;
          that.history[that.index].edit = that.history[that.index].edit.slice(0, that.position) + evt.key +
            that.history[that.index].edit.slice(that.position);
          that.position++;
          updateLine(that, e)
        }
      }
    });
  }

  C.prototype.print  = function (text) { 
    var p = document.createElement('p');
    p.innerText = text;
    this.element.appendChild(p);
    this.element.scrollTop = e.scrollHeight;
  }

  C.prototype.printHTML  = function (text) { 
    var p = document.createElement('p');
    p.innerHTML = text;
    this.element.appendChild(p);
    this.element.scrollTop = e.scrollHeight;
  }

  C.prototype.disablePrompt = function () { 
    var e = this.element.querySelector('.prompt');
    if (e) { 
      e.innerHTML = clean(this.promptText + this.history[this.index].edit);
      e.classList.remove('prompt');
    }    
  }
  
  C.prototype.prompt = function (text, callback) {
    var e = this.element.querySelector('.prompt');
    if (e) {
      return;
    }
    var p = document.createElement('p');
    p.classList.add('prompt');
    this.element.appendChild(p);
    ///p.innerHTML = clean(text) + cursor;
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
    updateLine(this, p);
    this.promptCallback = callback;
    this.element.scrollTop = this.element.scrollHeight;
    this.element.focus();
  }
  
  C.prototype.clear = function () { 
    while (this.element.firstChild) { 
      this.element.removeChild(this.element.firstChild);
    }
  }
  
  return new C();
}
