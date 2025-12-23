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
        "universal_11.jpg",
        "tkd_01.mp4",
    ];

    let xp = 0;
    let level_spacing = 60;
    let level = 0;
    const levels = images.map((image, i) => (i + 1) * level_spacing);

    console.log(levels)

    that.init = function() {
        elem.container = $t.id('diceRoller');
        elem.result = $t.id('result');
        elem.textInput = $t.id('textInput'); 
        elem.instructions = $t.id('instructions');
        elem.center_div = $t.id('center_div');

        elem.image_overlay = $t.id('image-overlay');
        elem.image = $t.id('image-display');
        elem.video = $t.id('video-display');
        elem.video_source = elem.video.querySelector('source');
        elem.image_overlay.addEventListener('click', () => {
            elem.image_overlay.classList.remove('show');
            elem.image.classList.remove('show');
            elem.video.classList.remove('show');
            elem.video.pause();

            show_instructions(true);
        });

        box = new DICE.dice_box(elem.container);
        box.bind_swipe(elem.center_div, before_roll, after_roll);
        box.setDice("1d4+1d6+1d8+1d10+1d12+1d20");

        show_instructions(true);

        elem.progress = $t.id('progress');
        elem.progress_bar = $t.id('progress-bar');
        elem.xp_label = $t.id('xp-label');
        for (let i = 0; i <= levels.length; i++) {
            const div = elem.progress.appendChild(document.createElement('div'));
            div.style.backgroundColor = i % 2 ? '#098113ff' : '#a30a0aff';
            div.style.height = '2rem';
            div.style.width = '5px';
            div.style.borderRadius = '5px';
        };
        update_progress();
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
            return;
        }

        let resultString = notation.result.join(' + ');
        resultString += ' = ' + notation.resultTotal + ' XP';

        elem.result.innerHTML = resultString;

        const total = notation.resultTotal;
        update_progress(total);

        if (xp >= levels[level]) {
            if (level >= levels.length - 1) {
                // XXX COMPLETED
                level = 0;
            }
            else {
                const image_name = images[level];
                
                if (image_name.endsWith('.mp4')) {
                    elem.video.src = "images/" + image_name;

                    elem.video.addEventListener('canplay', function() {
                        elem.image_overlay.classList.add('show');
                        elem.video.classList.add('show');
                        elem.video.play();
                    });
                } 
                else {
                    elem.image.src = "images/" + image_name;

                    elem.image.addEventListener('load', function() {
                        elem.image_overlay.classList.add('show');
                        elem.image.classList.add('show');
                    });
                }

                level++;
            }
        }
    }

    function update_progress(roll) {
        if (roll !== undefined) {
            xp += roll;
        }

        const fraction = xp / levels[levels.length - 1];

        elem.progress_bar.style.width = fraction * 100 + '%';

        elem.xp_label.style.left = 'calc(' + fraction * 100 + '% + .2rem)';
        elem.xp_label.textContent = 'XP: ' + xp;

        // /elem.progress.textContent = 'XP: ' + xp;
/*
        if (index >= 0 && index < seen.length) {
            seen[index] = true;
        }

        const rolls_children = elem.rolls.children;
        for (let i = 0; i < rolls_children.length; i++) {
            rolls_children[i].style.height = (rolls[i] / Math.max(...rolls)) * 100 + '%';
        }

        const progress_children = elem.progress.children;
        for (let i = 0; i < progress_children.length; i++) {
            progress_children[i].style.backgroundColor = seen[i] ? '#fff' : '#666';
        }
            */
    }

    return that;
}());
