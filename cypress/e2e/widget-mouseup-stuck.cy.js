/* global Cypress, cy */

Cypress.on("uncaught:exception", err => {
    const ignored = [
        "ResizeObserver loop limit exceeded",
        "Cannot read properties of undefined (reading 'postMessage')",
        "_ is not defined",
        "Permissions check failed",
        "cache() must be called before updateCache()"
    ];
    return !ignored.some(msg => err.message.includes(msg));
});

describe("Widget mouseup outside does not stick", () => {
    beforeEach(() => {
        cy.visit("http://localhost:3000");
        cy.waitForAppReady();
    });

    it("MusicKeyboard: releasing mouse outside resets drag state", () => {
        cy.window().then(win => {
            const activity = win.ActivityContext?.getActivity?.();
            expect(activity, "ActivityContext.getActivity()").to.exist;

            return new Promise(resolve => {
                win.require(["widgets/musickeyboard"], () => resolve(activity));
            });
        });

        cy.window().then(win => {
            const activity = win.ActivityContext.getActivity();

            const mk = new win.MusicKeyboard(activity);
            // Seed enough state so the table renders at least one pitch row + cells.
            mk.instruments = ["piano"];
            mk.noteNames = ["C"];
            mk.octaves = [4];
            mk._rowBlocks = [1];

            // Seed at least two note events so the table has 2+ columns.
            mk._notesPlayed = [
                {
                    startTime: 0,
                    noteOctave: "C4",
                    objId: null,
                    duration: 1,
                    voice: "piano",
                    blockNumber: 123
                },
                {
                    startTime: 1,
                    noteOctave: "C4",
                    objId: null,
                    duration: 1,
                    voice: "piano",
                    blockNumber: 123
                }
            ];
            mk.init();
            mk.makeClickable();
            win.__testMusicKeyboard = mk;
        });

        cy.get("#mkb0 td").as("cells");
        cy.get("@cells").its("length").should("be.greaterThan", 1);

        cy.get("@cells")
            .last()
            .then($cell => {
                const el = $cell[0];
                const initial = el.style.backgroundColor;

                cy.window().then(win => {
                    const mk = win.__testMusicKeyboard;
                    expect(mk, "test music keyboard instance").to.exist;
                    expect(typeof el.onmousedown, "cell.onmousedown").to.eq("function");
                    expect(typeof el.onmouseover, "cell.onmouseover").to.eq("function");
                    expect(typeof mk._matrixMouseUpListener, "mk._matrixMouseUpListener").to.eq(
                        "function"
                    );

                    // Simulate: mouse down in widget
                    el.onmousedown({ target: el });
                    const afterDown = el.style.backgroundColor;
                    expect(afterDown).to.not.eq(initial);

                    // While mouse down, moving over should toggle
                    el.onmouseover();
                    const afterOverWhileDown = el.style.backgroundColor;
                    expect(afterOverWhileDown).to.not.eq(afterDown);

                    // Simulate: mouseup happens outside the widget (document-level listener)
                    mk._matrixMouseUpListener();
                    const afterMouseUp = el.style.backgroundColor;

                    // Now mouseover should NOT toggle since isMouseDown has been reset
                    el.onmouseover();
                    expect(el.style.backgroundColor).to.eq(afterMouseUp);
                });
            });
    });
});

