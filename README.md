# IOTerm

A simple class for allowing terminal-style IO in a browser window.

## To use

Right now, this is only available as a direct file linkeable from an HTML page:

    <script src="ioterm.js"></script>

In the Javascript of the page, you can then initialize a terminal by providing the ID of an element, which should probably be a `div`, properly sized:

    <div id="term" style="width: 500px; height: 400px; border: 1px solid #dddddd; float: left;">
    </div>
    
    <script>

      const tio = new IOTerm('term')
      tio.printHTML ("<b><i>Console-like I/O widget</i></b><br><br>")
      tio.print ("You can .print() to it")
      tio.print ("And you can .prompt() from it")
      
      function loop () { 
	return tio.prompt("> ", v => { 
	  if (v === "clear") { 
	    tio.clear()
	  } else {
	    tio.print("You entered: "+v)
	  }
	  return loop ()
	})
      }
      
      loop()
      
    </script>

It should be pretty easy to embed in a React component, if that's how
you roll. I may well create such an embedding if I ever have a need
for it.
