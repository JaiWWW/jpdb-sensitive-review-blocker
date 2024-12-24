// ==UserScript==
// @name         JPDB Sensitive Review Blocker
// @namespace    http://tampermonkey.net/
// @version      1.2.1
// @description  Allows the user to quickly toggle blacklist user-set sensitive reviews (eg. for reviewing in public)
// @author       JaiWWW
// @match        https://jpdb.io/learn
// @match        https://jpdb.io/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jpdb.io
// @homepageURL  https://github.com/JaiWWW/jpdb-sensitive-review-blocker
// @supportURL   https://github.com/JaiWWW/jpdb-sensitive-review-blocker/issues/new
// @downloadURL  https://github.com/JaiWWW/jpdb-sensitive-review-blocker/raw/main/jpdb-sensitive-review-blocker.user.js
// @updateURL    https://github.com/JaiWWW/jpdb-sensitive-review-blocker/raw/main/jpdb-sensitive-review-blocker.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    async function getElement(html, selector, property=null) { // written by copilot
        return new Promise((resolve, reject) => {
            const observer = new MutationObserver((mutations, obs) => {
                const element = html.querySelector(selector);
                if (element) {
                    obs.disconnect();
                    if (property) {
                        resolve(element[property]);
                    } else {
                        resolve(element);
                    }
                }
            });

            observer.observe(html, {
                childList: true,
                subtree: true
            });

            // Fallback in case the element is already present
            const element = html.querySelector(selector);
            if (element) {
                observer.disconnect();
                if (property) {
                    resolve(element[property]);
                } else {
                    resolve(element);
                }
            }
        });
    }
    async function submitForm(form, deckid) { // written by copilot, could you tell?
        const formData = new FormData(form);
        const params = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
            params.append(key, value);
        }
        const action = `https://jpdb.io/deck/${deckid}/change-state-override`;
        const method = 'POST';
        const response = await fetch(action, {
            method: method,
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Cache-Control': 'max-age=0',
                'Origin': 'https://jpdb.io',
                'Referer': `https://jpdb.io/deck/${deckid}/change-state-override`,
                'Upgrade-Insecure-Requests': '1'
            }
        });
        return response;
    }
    async function isBlacklisted(deckid) { // if the deck is in a different state, unblacklist it
        const res = await fetch(`https://jpdb.io/deck/${deckid}/change-state-override`);
        const text = await res.text();
        const html = new DOMParser().parseFromString(text, "text/html");

        const blacklistElement = await getElement(html, '#deck-state-override-blacklisted');
        const normalElement = await getElement(html, '#deck-state-override-normal');
        if (blacklistElement.checked) {
            return true;
        } else if (normalElement.checked) {
            return false;
        } else { // If neither is checked, unblacklist the deck
            normalElement.click();

            const submitButton = await getElement(html, "[type='submit']");
            const form = submitButton.closest('form');
            await submitForm(form, deckid);
            
            return false;
        }
    }
    async function toggleBlacklist(deckid) { // returns true if blacklisted, false if unblacklisted, also unblacklists if neither
        const res = await fetch(`https://jpdb.io/deck/${deckid}/change-state-override`);
        const text = await res.text();
        const html = new DOMParser().parseFromString(text, "text/html");
        let isBlacklisted; // return value

        const normalElement = await getElement(html, '#deck-state-override-normal');
        if (normalElement.checked) {
            const blacklistElement = await getElement(html, '#deck-state-override-blacklisted');
            blacklistElement.click();
            isBlacklisted = true;
        } else { // if blacklisted or in a different state, unblacklist
            normalElement.click();
            isBlacklisted = false;
        }
        const submitButton = await getElement(html, "[type='submit']");
        
        const form = submitButton.closest('form');
        await submitForm(form, deckid);

        return isBlacklisted;
    }
    function createToggles() { // from https://tablericons.com
        const leftToggle = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-toggle-left" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M8 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
  <path d="M2 6m0 6a6 6 0 0 1 6 -6h8a6 6 0 0 1 6 6v0a6 6 0 0 1 -6 6h-8a6 6 0 0 1 -6 -6z" />
</svg>`;
        const rightToggle = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-toggle-right" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M16 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
  <path d="M2 6m0 6a6 6 0 0 1 6 -6h8a6 6 0 0 1 6 6v0a6 6 0 0 1 -6 6h-8a6 6 0 0 1 -6 -6z" />
</svg>`;
        return [leftToggle, rightToggle]
    }
    async function createSwitchElement(deckid) {
        // Create the main container for the switch element
        const switchContainer = document.createElement('div');
        switchContainer.style.display = 'flex';
        switchContainer.style.alignItems = 'center';
        switchContainer.style.justifyContent = 'space-between';
        switchContainer.style.padding = '10px';
        switchContainer.style.border = '1px solid #444';
        switchContainer.style.borderRadius = '5px';
        switchContainer.style.marginTop = '10px';
    
        // Create the text labels
        const allowText = document.createElement('span');
        allowText.textContent = 'Allow sensitive reviews';
        allowText.style.marginRight = '10px';
        allowText.style.fontSize = '14px';
        allowText.style.color = '#ddd';
    
        const blockText = document.createElement('span');
        blockText.textContent = 'Block sensitive reviews';
        blockText.style.marginLeft = '10px';
        blockText.style.fontSize = '14px';
        blockText.style.color = '#ddd';
    
        // Create the toggle button
        const toggleButton = document.createElement('i');
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.fontSize = '24px';
        toggleButton.style.color = '#ddd';
    
        // Append elements to the container
        switchContainer.appendChild(allowText);
        switchContainer.appendChild(toggleButton);
        switchContainer.appendChild(blockText);
    
        // Get the toggle icons
        let leftToggle, rightToggle;
        [leftToggle, rightToggle] = createToggles();
    
        // Set the initial state of the toggle button
        if (await isBlacklisted(deckid)) {
            toggleButton.innerHTML = rightToggle;
        } else {
            toggleButton.innerHTML = leftToggle;
        }
    
        // Add click event listener to the toggle button
        toggleButton.addEventListener('click', async () => {
            if (await toggleBlacklist(deckid)) {
                toggleButton.innerHTML = rightToggle;
            } else {
                toggleButton.innerHTML = leftToggle;
            }
        });
    
        return switchContainer;
    }
    function noDeckId() {
        const container = document.createElement('div');
        container.style.marginTop = '20px';
        const promptText = document.createElement('p');
        promptText.textContent = 'Please enter the ID of the deck you use to store sensitive cards:';
        // update this to allow user to select deck without knowing the ID
    
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Deck ID';
    
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
    
        submitButton.addEventListener('click', () => {
            const deckId = inputField.value;
            if (deckId) { // update this to check the deck exists
                localStorage.setItem('sensitive-deck-id', deckId);
                location.reload(); // Reload the page to apply the new deck ID
            } else {
                alert('Please enter a valid deck ID.');
            }
        });
    
        container.appendChild(promptText);
        container.appendChild(inputField);
        container.appendChild(submitButton);
    
        return container;
    }
    async function addSwitch(deckid) {
        const reviewButton = document.querySelector("form[action='/review#a']");
        reviewButton.insertAdjacentElement('afterend', deckid ? await createSwitchElement(deckid) : noDeckId());
    }

    addSwitch(localStorage.getItem('sensitive-deck-id'));

})();
