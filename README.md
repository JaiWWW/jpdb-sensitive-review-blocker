# jpdb-sensitive-review-blocker
A script for jpdb allowing the user more peace of mind while reviewing in public  
  
Tested with Tampermonkey on Opera. If you use a different browser or script manager, please let me know whether it works or not in [issues](https://github.com/JaiWWW/jpdb-sensitive-review-blocker/issues) or [on Discord](https://discord.gg/5vf2NRPSq7): @jaiwww

## Features
- Allows users to designate a deck for sensitive cards
- Adds a switch under the 'start reviewing' button to toggle reviewing cards in the designated deck (via blacklist)
- **NOTE: this script does not include or generate a list of potentially sensitive items. It is up to the user to put sensitive cards in their designated deck when they come across them.**

## Installation
> To install this script, make sure you have Tampermonkey (may or may not work with other script managers) and then click [here](https://github.com/JaiWWW/jpdb-sensitive-review-blocker/raw/main/jpdb-sensitive-review-blocker.user.js), or click <ins>jpdb-sensitive-review-blocker.user.js</ins> above and then click the **Raw** button.

## Limitations
- Does not automatically include all potentially sensitive items, instead requiring the user to manually add these.

## Known bugs that I can't be bothered to investigate
- No known bugs

## Known bugs that I'm working on
- No known bugs

## Future ideas
- Make the due count update on toggling
> Maybe make this configurable since I will probably have to do network processes for it which take time
> Also see if I can tell the user how many due reviews are being blocked by the script
- When no deck is selected, make a button that creates a new deck and selects it
- Validate deck ID input by checking a deck with the given ID exists
- Allow the user to select an existing deck without having to find the ID for it
- Allow the user to deselect the selected deck
- Investigate whether fetching the override page is redundant - probably can just submit an API request immediately
