// Modern ES6 version of pong.js without RequireJS
// Dependencies are loaded as needed

document.addEventListener('DOMContentLoaded', async function() {
    // Wait for socket.io to be available (loaded via script tag)
    while (typeof io === 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    const socket = io();

    const session = location.hash.split('#')[1].split(',')[0];
    const player = location.hash.split('#')[1].split(',')[1];

    socket.emit('player', { session: session, 'player': player });

    // Modern DOM utility functions
    const $ = (selector) => {
        const elements = document.querySelectorAll(selector);
        return {
            css: (prop, value) => {
                elements.forEach(el => {
                    if (typeof prop === 'object') {
                        Object.assign(el.style, prop);
                    } else {
                        el.style[prop] = value;
                    }
                });
                return this;
            },
            height: () => elements[0]?.offsetHeight || 0,
            on: (event, handler) => {
                elements.forEach(el => el.addEventListener(event, handler));
                return this;
            },
            addClass: (className) => {
                elements.forEach(el => el.classList.add(className));
                return this;
            },
            removeClass: (className) => {
                elements.forEach(el => el.classList.remove(className));
                return this;
            }
        };
    };

    // Set up character sizing
    const chars = $('.char');
    const charHeight = chars.height();
    chars.css('fontSize', charHeight + 'px')
         .css('lineHeight', charHeight + 'px');

    // Touch/pointer event handlers
    function handleDirection(direction, target) {
        socket.emit('navigation', { 'direction': direction, 'player': player, 'session': session });
        if (target) {
            target.classList.add('glow');
            setTimeout(() => {
                target.classList.remove('glow');
            }, 500);
        }
    }

    $('#up').on('pointerup', function(ev) {
        handleDirection('up', ev.target);
    });

    $('#down').on('pointerup', function(ev) {
        handleDirection('down', ev.target);
    });

    // Keyboard event handlers (replacing Mousetrap with native events)
    document.addEventListener('keyup', function(ev) {
        if (ev.key === 'ArrowUp') {
            handleDirection('up');
            ev.preventDefault();
            return false;
        }
        if (ev.key === 'ArrowDown') {
            handleDirection('down');
            ev.preventDefault();
            return false;
        }
    });
});