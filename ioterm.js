
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

  function C () {

    var that = this;
    this.element = e;
    this.key_control = false;
    // need to handle this
    this.history = []
    this.index = 0;    // index of where we are in the history
    
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
          var input = that.history[that.index].edit;
          var callback = that.promptCallback;
          that.disablePrompt();
          if (callback) { return callback(input); } 
        }
        else if (evt.key === 'Backspace') {
          var len = that.history[that.index].edit.length;
          that.history[that.index].edit = that.history[that.index].edit.slice(0, len - 1);
          e.innerHTML = clean(that.promptText + that.history[that.index].edit) + cursor;
        }
        else if (evt.key === 'Control') {
	  that.key_control = true;
        }
        else if (evt.key.length > 1) {
          // we got a control key - skip
          return;
        }
        else if (that.key_control && evt.key.toLowerCase() === 'p') {
          if (that.index < that.history.length - 1) { 
            ///console.log('PREVIOUS');
            that.index++;
            e.innerHTML = clean(that.promptText + that.history[that.index].edit) + cursor;
          }
        }
        else if (that.key_control && evt.key.toLowerCase() === 'n') {
          if (that.index > 0) { 
            ///console.log('NEXT');
            that.index--;
            e.innerHTML = clean(that.promptText + that.history[that.index].edit) + cursor;
          }
        }
        else { 
          that.history[that.index].edit += evt.key;
          e.innerHTML = clean(that.promptText + that.history[that.index].edit) + cursor;
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
    p.innerHTML = clean(text) + cursor;
    this.element.appendChild(p);
    // save originals
    this.history.forEach(function(entry) { entry.original = entry.edit });
    ///console.log(this.history);
    this.history.unshift({edit: ''});
    this.index = 0;
    this.promptText = text;
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
