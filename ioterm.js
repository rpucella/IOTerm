
function ioterm (id, options) { 

  options = options || {}
  var e = document.getElementById(id);
  var cursor = "<span class='cursor'>&#x258d;</span>";

  function clean (text) { 
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }

  function C () { 
    var that = this;
    e.setAttribute("tabindex", "0");
    e.style["overflow-y"] = "scroll";
    e.style["outline"] = "none";
    e.classList.add("io");
    e.addEventListener("keypress", function(evt) {
      evt.preventDefault();
    });
    e.addEventListener("keyup", function(evt) { 
      evt.preventDefault();
      if (evt.key === "Control") {
	that.key_control = false;
      }
    });
    e.addEventListener("keydown", function(evt) { 
      evt.preventDefault();
      // console.log("Key = ", evt.key);
      var e = that.element.querySelector(".prompt");
      if (e) { 
        that.element.scrollTop = that.element.scrollHeight;
        if (evt.key === "Enter") { 
          //console.log("Input:", that.input);
          var input = that.input;
          var callback = that.promptCallback;
          that.disablePrompt();
          if (callback) { return callback(input); } 
        } else if (evt.key === "Backspace") { 
          that.input = that.input.slice(0, that.input.length-1);
          e.innerHTML = clean(that.promptText + that.input) + cursor;
	} else if (evt.key === "Control") {
	  that.key_control = true;
	} else if (!options.showControl && evt.key.length > 1) { 
	  return;
        } else { 
          that.input += evt.key;
          e.innerHTML = clean(that.promptText + that.input) + cursor;
        }
      }
    });
    this.element = e;
    this.input = "";
    this.key_control = false;
    // need to handle this
    this.history = [];
  }
  
  C.prototype.print  = function (text) { 
    var p = document.createElement("p");
    p.innerText = text;
    this.element.appendChild(p);
    this.element.scrollTop = e.scrollHeight;
  }

  C.prototype.printHTML  = function (text) { 
    var p = document.createElement("p");
    p.innerHTML = text;
    this.element.appendChild(p);
    this.element.scrollTop = e.scrollHeight;
  }

  C.prototype.disablePrompt = function () { 
    var e = this.element.querySelector(".prompt");
    if (e) { 
      e.innerHTML = clean(this.promptText + this.input);
      e.classList.remove("prompt");
      this.input = "";
      this.promptText = "";
      this.promptCallback = null;
    }    
  }
  
  C.prototype.prompt = function (text, callback) { 
    var e = this.element.querySelector(".prompt");
    if (e) {
      return;
    }
    var p = document.createElement("p");
    p.classList.add("prompt");
    p.innerHTML = clean(text) + cursor;
    this.element.appendChild(p);
    this.input = "";
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
