// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).
let originalText = "";
// This shows the HTML page in "ui.html".
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        if (figma.currentPage.selection.length !== 1 || figma.currentPage.selection[0].type != "TEXT") {
            //setInterval(function(){
            figma.showUI(__html__, { width: 200, height: 220 });
            //return "ok"
            //});
            // a future feature
            /*for ( let c in figma.currentPage.children){
                    if (figma.currentPage.children[c].type=="TEXT"){
                        figma.currentPage.selection=[<TextNode>figma.currentPage.children[c]]
                        break;
                    }
            }
            if (figma.currentPage.selection.length !== 1){
                return "Please create at least one text node."
            }*/
        }
        let selection;
        let selectionWidth;
        try {
            selection = figma.currentPage.selection[0];
            selectionWidth = selection.width;
        }
        catch (e) {
            selectionWidth = 200;
        }
        if (figma.currentPage.selection.length == 0) {
            selectionWidth = 200;
        }
        // listen to changes on selection
        setInterval(function () {
            if (figma.currentPage.selection.length == 0 || figma.currentPage.selection[0].type != "TEXT") {
                figma.ui.postMessage({ text: "" });
                return;
            }
            if (figma.currentPage.selection[0] != selection) {
                selection = figma.currentPage.selection[0];
                figma.ui.resize(Math.max(200, selection.width + 20), Math.max(selection.height + 50, 220));
                let tf = selection;
                figma.ui.postMessage({ text: reverseIt(tf.characters, false), width: tf.width, height: tf.height, font: tf.fontName.family, fontSize: tf.fontSize, textAlign: tf.textAlignHorizontal.toLowerCase() });
                return;
            }
            // change in textbox size
            if (selection.width != selectionWidth) {
                selection = figma.currentPage.selection[0];
                selectionWidth = selection.width;
                figma.ui.resize(Math.max(200, selection.width + 20), Math.max(selection.height + 50, 220));
                //figma.showUI(__html__,{width:Math.max(200,selection.width+20),height:Math.max(selection.height+50,220)});
                let tf = selection;
                figma.ui.postMessage({ text: reverseIt(tf.characters, false), width: tf.width, height: tf.height, font: tf.fontName.family, fontSize: tf.fontSize, textAlign: tf.textAlignHorizontal.toLowerCase() });
            }
        }, 300);
        if (selection && selection.type == "TEXT") {
            figma.showUI(__html__, { width: Math.max(200, selection.width + 20), height: Math.max(selection.height + 50, 220) });
            let tf = selection;
            originalText = tf.characters;
            figma.ui.postMessage({ text: reverseIt(tf.characters, false), width: tf.width, height: tf.height, font: tf.fontName.family, fontSize: tf.fontSize, textAlign: tf.textAlignHorizontal.toLowerCase() });
            return "ok";
        }
        else {
            //return "Please select a single text node"
        }
    });
}
main().then((message) => {
    if (message != "ok") {
        //figma.closePlugin(message)
    }
});
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    if (msg.type === 'cancel') {
        if (figma.currentPage.selection.length == 0 || figma.currentPage.selection[0].type != "TEXT") {
            figma.closePlugin();
            return;
        }
        let selection = figma.currentPage.selection[0];
        if (selection.type == "TEXT") {
            let tf = selection;
            let fon = tf.fontName;
            figma.loadFontAsync({ family: fon.family, style: fon.style }).then((res) => {
                //tf.textAlignHorizontal="RIGHT"
                tf.characters = originalText;
                figma.closePlugin();
            });
        }
        else {
            figma.closePlugin();
        }
    }
    if (msg.type === 'input' || msg.type === 'change') {
        if ((figma.currentPage.selection.length == 0 || figma.currentPage.selection[0].type != "TEXT") && msg.type == 'input') {
            figma.closePlugin();
            return;
            //return "Please select a single text node"
        }
        let selection = figma.currentPage.selection[0];
        if (selection.type == "TEXT") {
            let tf = selection;
            let fon = tf.fontName;
            figma.loadFontAsync({ family: fon.family, style: fon.style }).then((res) => {
                if (tf.textAutoResize == "WIDTH_AND_HEIGHT" || tf.textAutoResize == "HEIGHT") {
                    tf.resize(200, tf.height);
                    tf.textAutoResize = "NONE";
                    //tf.textAlignHorizontal="RIGHT";
                    tf.x = tf.x - 200;
                }
                // tf.textAlignHorizontal="RIGHT"
                tf.characters = reverseIt(msg.rtltext, true);
                if (msg.type === 'input') {
                    figma.closePlugin();
                }
            });
        }
        else {
            // return "Please select a single text node"
        }
    }
    if (msg.type === 'changeheight') {
        const selection = figma.currentPage.selection[0];
        let tf = selection;
        //	tf.resizeWithoutConstraints(tf.width,msg.h)
    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
};
function wrapLines(val) {
    /* make sure  all wrap generated lines */
    let results = "";
    let textElm = figma.createText();
    const tf = figma.currentPage.selection[0];
    let fon = tf.fontName;
    //figma.loadFontAsync({ family: fon.family, style: fon.style}).then((res)=>{
    let curLine = "";
    let curLineWidth = 0;
    for (let i = 0; i < val.length; i++) {
        let curLetter = val.substr(i, 1);
        textElm.fontName = tf.fontName;
        textElm.fontSize = tf.fontSize;
        textElm.characters = curLine + curLetter;
        //textElm.setAttribute("style","font-family='" + font+"';font-size:" + fontSize +"px")
        curLineWidth = textElm.width;
        if (curLineWidth > tf.width) {
            if (curLetter != " ") {
                for (let j = curLine.length - 1; j > 1; j--) {
                    if (curLine.substr(j, 1) != " ") {
                        i--;
                    }
                    else {
                        curLine = curLine.substr(0, j);
                        i--;
                        break;
                    }
                }
            }
            results = results + curLine + "\n";
            curLine = "";
        }
        else {
            curLine += curLetter;
        }
    }
    results = results + curLine;
    //})
    textElm.remove();
    return results;
}
function shuffleLine(theLine, theShuffleChar) {
    //alert (theLine);
    //alert (theShuffleChar);
    let theResult = "";
    let theShuffleLoc = theLine.indexOf(theShuffleChar);
    let theLineLength = theLine.length;
    if (theShuffleLoc >= 0) {
        for (let j = theShuffleLoc + 1; j < theLineLength - 1; j++) {
            theResult = theResult + theLine.charAt(j);
        }
        // theResult=shuffleLine (theResult, theShuffleChar);  // For recursive flips
        theResult = theResult + theLine.charAt(theShuffleLoc);
        for (let k = 0; k < theShuffleLoc; k++) {
            theResult = theResult + theLine.charAt(k);
        }
        theResult = theResult + theLine.charAt(theLineLength - 1);
        return (theResult);
    }
    else {
        return (theLine);
    }
}
function reverseIt(val, wrap) {
    if (wrap) {
        val = wrapLines(val);
    }
    let theLineChars = "\r\n";
    let theStraightChars = "";
    let theFlipChars = "~"; // Characters that cause reversal of two sides of the line: "abc | def" -> " def|abc "
    //	if (this.form1.Numbers.checked)
    theStraightChars = "0123456789" + theStraightChars;
    //	if (this.form1.Dashes.checked)
    theStraightChars = "./:-" + theStraightChars;
    //	if (this.form1.English.checked)
    theStraightChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" + theStraightChars;
    //	if (this.form1.Newline.checked)
    let theShuffleChar = "~";
    let theString = val; //+ "\r\n";
    let theReverse = "";
    let theReverseArea = "";
    let theStraightBuffer = "";
    let theLength = theString.length;
    for (let i = 0; i < theLength; i++) {
        if (theLineChars.indexOf(theString.charAt(i)) >= 0) {
            // EOL
            if (theStraightBuffer != "") {
                theReverse = theStraightBuffer + theReverse;
                theStraightBuffer = "";
            }
            if (theString.charAt(i) == "\n") {
                //	if (this.form1.Newline.checked) {
                //	alert (theReverse);
                theReverse = shuffleLine(theReverse, theShuffleChar);
                //	} else {
                //	theReverse=shuffleLine(theReverse, "\n");
                //	}
            }
            theReverse = theReverse + theString.charAt(i);
        }
        else {
            if (theStraightChars.indexOf(theString.charAt(i)) >= 0) {
                theStraightBuffer = theStraightBuffer + theString.charAt(i);
            }
            else {
                if (theStraightBuffer != "") {
                    theReverse = theStraightBuffer + theReverse;
                    theStraightBuffer = "";
                }
                theReverse = theString.charAt(i) + theReverse;
            }
        }
        if (theString.charAt(i) == "\n") {
            theReverseArea = theReverseArea + theReverse;
            theReverse = "";
        }
    }
    if (theStraightBuffer != "") {
        theReverse = theStraightBuffer + theReverse;
        theStraightBuffer = "";
    }
    theReverseArea = theReverseArea + theReverse;
    return theReverseArea;
}
