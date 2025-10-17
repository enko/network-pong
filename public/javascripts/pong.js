// Modern ES6 version of pong.js without RequireJS
// Dependencies are loaded as needed

document.addEventListener('DOMContentLoaded', async function () {
    console.log('Pong controller script loaded');

    // Wait for socket.io to be available (loaded via script tag)
    while (typeof io === 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('Socket.io available');
    const socket = io();

    const session = location.hash.split('#')[1].split(',')[0];
    const player = location.hash.split('#')[1].split(',')[1];

    console.log('Session:', session, 'Player:', player);

    socket.emit('player', { session: session, 'player': player });

    // Set up character sizing
    const charElements = document.querySelectorAll('.char');
    if (charElements.length > 0) {
        const charHeight = charElements[0].offsetHeight;
        charElements.forEach(char => {
            char.style.fontSize = charHeight + 'px';
            char.style.lineHeight = charHeight + 'px';
        });
    }

    // Touch/pointer event handlers
    function handleDirection(direction, buttonElement) {
        console.log('Button pressed:', direction);
        socket.emit('navigation', { 'direction': direction, 'player': player, 'session': session });

        // Flash the button for visual feedback
        const charElement = buttonElement ? buttonElement.querySelector('.char') :
            document.querySelector(`#${direction} .char`);

        if (charElement) {
            console.log('Adding glow effect to:', charElement);
            charElement.classList.add('glow');
            setTimeout(() => {
                charElement.classList.remove('glow');
                console.log('Removed glow effect');
            }, 300);
        } else {
            console.log('Could not find char element for direction:', direction);
        }
    }

    // Get button elements
    const upButton = document.getElementById('up');
    const downButton = document.getElementById('down');

    console.log('Up button:', upButton);
    console.log('Down button:', downButton);

    // Add multiple event types for better compatibility
    const events = ['touchstart', 'mousedown', 'pointerdown'];

    events.forEach(eventType => {
        if (upButton) {
            upButton.addEventListener(eventType, function (ev) {
                console.log('Up button event:', eventType);
                ev.preventDefault();
                handleDirection('up', upButton);
            }, { passive: false });
        }

        if (downButton) {
            downButton.addEventListener(eventType, function (ev) {
                console.log('Down button event:', eventType);
                ev.preventDefault();
                handleDirection('down', downButton);
            }, { passive: false });
        }
    });

    console.log('Event listeners attached for:', events);

    // Keyboard event handlers
    document.addEventListener('keydown', function (ev) {
        if (ev.key === 'ArrowUp' || ev.key === 'Up') {
            ev.preventDefault();
            handleDirection('up');
            return false;
        }
        if (ev.key === 'ArrowDown' || ev.key === 'Down') {
            ev.preventDefault();
            handleDirection('down');
            return false;
        }
    });
});