"use strict";

/** @brief 3d dice roller web app
 *  @author Sarah Rosanna Busch
 *  @date 10 Aug 2023
 *  @version 0.1
 */

 var main = (function() {
    var that = {}; 
    var elem = {}; 
    var vars = {
        numpadShowing: false,
        lastVal: '',
        userTyping: false
    }
    var box = null;

    const images = [
        "universal_01.jpg",      
        "universal_02.jpg",
        "universal_03.jpg",
        "universal_05.jpg",
        "universal_06.jpg",
        "universal_08.jpg",
        "universal_09.jpg",
        "universal_10.jpg",
        "universal_11.jpg"
    ];

    that.init = function() {
        elem.container = $t.id('diceRoller');
        elem.result = $t.id('result');
        elem.textInput = $t.id('textInput'); 
        elem.instructions = $t.id('instructions');
        elem.center_div = $t.id('center_div');

        elem.image_overlay = $t.id('image-overlay');
        elem.image = $t.id('image-display');
        elem.video = $t.id('video-display');
        elem.image_overlay.addEventListener('click', () => {
            elem.image.classList.remove('show');
        });

        box = new DICE.dice_box(elem.container);
        box.bind_swipe(elem.center_div, before_roll, after_roll);
        box.setDice("1d4+1d6+1d8+1d10+1d12+1d20");

        show_instructions(true);
    }

    that.setInput = function() {
        let inputVal = elem.textInput.value;
        //check for d100 and add tens place die
        if(inputVal.includes('d100')) {
            let dIdx = inputVal.indexOf('d100');
            let numD100 = '';
            for(let i = dIdx - 1; i >= 0; i--) {
                let digit = inputVal[i];
                if(!isNaN(digit)) {
                    numD100 = digit + numD100;
                } else {
                    break;
                }                
            }
            if(numD100 === '') numD100 = '1';
            //console.log('num d100s: ' + numD100);
            for(let i = 0; i < numD100; i++) {
                inputVal += '+d9';
            }
        }
        //check for too many dice
        let d = DICE.parse_notation(inputVal);
        let numDice = d.set.length;
        if(numDice > 20) {
            elem.diceLimit.style.display = 'block';
        } else {
            box.setDice(inputVal);
            show_numPad(false);
            show_instructions(true);
        }
    }

    that.clearInput = function() {
        elem.textInput.value = '';
    }

    //called from numPad onclicks
    that.input = function(value) {
        vars.lastVal = value;
        vars.userTyping = true;
        elem.textInput.focus();
    }

    function _handleInput() {
        let text = elem.textInput.value;
        let selectedText = (vars.caretPos === vars.selectionEnd) ? false : true;
        if(vars.lastVal === "del") {
            if(selectedText) {
                deleteText();
            } else {
                text = text.substring(0, vars.caretPos) + text.substring(vars.caretPos+1, text.length);
            }
        } else if(vars.lastVal === "bksp") {
            if(selectedText) {
                deleteText();
            } else {
                text = text.substring(0, vars.caretPos-1) + text.substring(vars.caretPos, text.length);
                vars.caretPos--;
            }
        } else {
            deleteText();
            text = text.substring(0, vars.caretPos) + vars.lastVal + text.substring(vars.caretPos, text.length);
            vars.caretPos++;
        }
        elem.textInput.value = text;
        setTimeout(() => {
            elem.textInput.setSelectionRange(vars.caretPos, vars.caretPos);
        }, 1);

        function deleteText() {
            text = text.substring(0, vars.caretPos) + text.substring(vars.selectionEnd, text.length);
            setTimeout(() => {
                elem.textInput.setSelectionRange(vars.caretPos, vars.caretPos);
            }, 1);
        }
    }

    // show 'Roll Dice' swipe instructions
    // param show = bool
    function show_instructions(show) {
        if(show) {
            elem.instructions.style.display = 'inline-block';
        } else {
            elem.instructions.style.display = 'none';
        }
    }

    // show input options
    // param show = bool
    function show_numPad(show) {
        if(show) {
            vars.numpadShowing = true;
            elem.numPad.style.display = 'inline-block';
            elem.textInput.focus();
        } else {
            vars.numpadShowing = false;
            elem.textInput.blur();
            elem.numPad.style.display = 'none';
        }
    }

    // @brief callback function called when dice roll event starts
    // @param notation indicates which dice are going to roll
    // @return null for random result || array of desired results
    function before_roll(notation) {
        //console.log('before_roll notation: ' + JSON.stringify(notation));
        show_instructions(false);
        elem.result.innerHTML = '';       
        return null;
    }

    // @brief callback function called once dice stop moving
    // @param notation now includes results
    function after_roll(notation) {
        //console.log('after_roll notation: ' + JSON.stringify(notation));
        if(notation.result[0] < 0) {
            elem.result.innerHTML = "Oops, your dice fell off the table. <br> Refresh and roll again."
        } else {
            elem.result.innerHTML = notation.resultString;

        }

        const total = notation.resultTotal;
        const image_index = total % images.length;
        const image_name = images[image_index];
        elem.image.src = "images/" + image_name;
        elem.image.classList.add('show');

    }

    return that;
}());
