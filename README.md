# Tely's Battle Pass

Standalone Foundry VTT v14 module. Compatible with Tely's Star Rail Ultimates v2; that module is optional. Install by extracting this directory into Foundry's Data/modules folder and enabling it in Manage Modules. Open with the gift button at the lower left or the scene control. GM opens Configure from the battle pass.

The Rewards and Missions screens follow the supplied visual references, with high contrast cards and compact icon tabs. Configure weekly and period missions with progress targets and EXP. GMs can adjust player mission progress and mark completion to credit EXP.

Configure the three tab titles, progress levels and EXP, end date, rules, two reward tracks, mission text and EXP, Glory purchase item cost, and rotating preview PNG paths. The default tracks contain all 50 levels of Nameless Gift and Nameless Glory, using the Star Rail Materials compendium and the world Items for IPC Credits and passes. Credit rewards divide the listed Star Rail amounts by 1,000. Worlds with both reward tracks empty receive these defaults; existing custom rewards are preserved. Drop Item documents from the Foundry sidebar into the UUID inputs. Each player needs an assigned character holding the configured purchase item; the player clicks Buy Premium Battle Pass while a GM is online, or the GM selects the player and purchases it. Both tracks support a second reward slot when a level has multiple items, including the two Gift rewards at level 50. Existing Honor rewards appear in Glory slot 2 when upgrading. GM mission completion credits EXP once, permanently checks that mission for that player, and unlocks reward eligibility. GM clicks Grant to put reward Items on that player's character; claims cannot be repeated. Progress lives on user flags; configuration lives in a world setting.

Use the public macro `TelyBattlePass.open()` to open the window. This also works as a call from Ultimates v2's macro or UI actions. There is no private API dependency.

The supplied screenshot is a visual reference, not embedded game art. GM preview image paths can point to PNG files uploaded to Foundry's File Browser. Purchase item quantities and reward item quantities use the standard Item `system.quantity` field.

The GM can set images for the top-left symbol and both reward tier bars in Configure. Use Browse, drag a File Browser image onto the path field, or paste its Foundry image path. Images are referenced by path and should remain in the Foundry data directory.

The battle-pass viewer has a frameless drag margin. Drag it to reposition the window, double-click it or use its minimize button to collapse the pass, and configure an uploaded image for each navigation tab from the Interface Images section.

Progress can be configured per player or shared by the entire group. Reward claims can target the selected player's main character or every character marked **Is in Main Party** by Tely's Star Rail Ultimates, either copying the full reward to each character or splitting the configured quantity across the party.

Reward distribution adds quantity to an existing matching stack when the item
supports quantities. Matching uses source identity, with an exact item-definition
match for older copies without source metadata. Items without quantities are
granted as individual copies.


## Carousel, premium, and mission controls

In Configure, use **Rewards artwork carousel** to add or remove images. Use
**Browse**, drop an image from the File Browser, or enter its path. Set the
seconds between images. Existing preview images remain available to edit.
Drop a Light Cone Item to use its artwork automatically, or choose an image
with Browse. Existing Item UUIDs in image fields resolve to their Item artwork.
One image is shown at a time, fading out and then fading in to the next. This
carousel is a display only. Rewards are granted through the level reward tracks.

Under **Premium Battle Pass purchase**, choose an inventory currency Item or a
character currency key such as `gp`, and set its amount. Players can buy premium
from the Rewards screen while a GM is online. The GM validates the balance,
charges the character, and unlocks premium. Shared progress mode unlocks premium
for the shared pass when one player pays. The player receives the purchase result.

The GM's Missions tab includes **Reset all missions**. After confirmation, this
clears weekly and period mission counters and completion for every player (or
the shared pass). Earned EXP, claimed rewards, and premium access are kept.
Reset missions can be completed again for EXP.

Battle Pass and HSR mission rewards recognize each other's source metadata and
add matching quantities to one inventory stack. Older identical copies are also
recognized. Items without a quantity field receive individual copies.
