# Tely's Battle Pass

Standalone Foundry VTT v14 module. Compatible with Tely's Star Rail Ultimates v2; that module is optional. Install by extracting this directory into Foundry's Data/modules folder and enabling it in Manage Modules. Open with the gift button at the lower left or the scene control. GM opens Configure from the battle pass.

Configure the three tab titles, progress levels and EXP, end date, rules, two reward tracks, mission text and EXP, Glory purchase item cost, and rotating preview PNG paths. Drop Item documents from the Foundry sidebar into the UUID inputs. Each player needs an assigned character holding the configured purchase item; the GM selects the player and clicks Unlock. Each Glory level has two independent reward slots; Gift has one. Existing Honor rewards appear in Glory slot 2 when upgrading. GM mission completion credits EXP once, permanently checks that mission for that player, and unlocks reward eligibility. GM clicks Grant to put reward Items on that player's character; claims cannot be repeated. Progress lives on user flags; configuration lives in a world setting.

Use the public macro `TelyBattlePass.open()` to open the window. This also works as a call from Ultimates v2's macro or UI actions. There is no private API dependency.

The supplied screenshot is a visual reference, not embedded game art. GM preview image paths can point to PNG files uploaded to Foundry's File Browser. Purchase item quantities and reward item quantities use the standard Item `system.quantity` field.
