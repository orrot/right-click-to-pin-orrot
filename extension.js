import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { WindowPreview } from 'resource:///org/gnome/shell/ui/windowPreview.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Clutter from 'gi://Clutter';

export default class RightClickToPin extends Extension {
    enable() {
        this._origInit = WindowPreview.prototype._init;
        this._origHandle = WindowPreview.prototype._handleDirectClick;

        const self = this;
        WindowPreview.prototype._init = function(...args) {
            WindowPreview.prototype._origInitInternal.apply(this, args);

            // 1. GNOME 49 FIX: We connect to the event but DON'T use clear_actions()
            // instead we use the 'captured-event' signal on the actor to snatch the right click
            this.connect('button-press-event', (actor, event) => {
                if (event.get_button() === 3) {
                    const win = this.metaWindow;
                    if (win) {
                        if (win.is_on_all_workspaces()) {
                            win.unstick();
                            // Main.notify("Window Unpinned");
                        } else {
                            win.stick();
                            // FIX: Ensure it doesn't stay 'Always on Top'
                            win.make_above(); // Toggle it on...
                            win.unmake_above(); // ...then immediately off to reset layer priority
                            // Main.notify("Window Pinned (Not on Top)");
                        }
                        return Clutter.EVENT_STOP;
                    }
                }
                return Clutter.EVENT_PROPAGATE;
            });
        };

        WindowPreview.prototype._origInitInternal = this._origInit;
    }

    disable() {
        WindowPreview.prototype._init = WindowPreview.prototype._origInitInternal;
        delete WindowPreview.prototype._origInitInternal;
    }
}
