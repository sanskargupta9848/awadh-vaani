onboarding: `
    <div class="onboarding-card fade-in">
        <header>
            <h1 class="logo">अवधVaani</h1>
            <p class="tagline">"Awadhi ki awaaz, aapki zuban"</p>
        </header>

        <div class="selection-container" style="text-align: left; margin-top: 20px;">
            <label style="color: var(--forest-green); font-weight: bold; font-size: 0.8rem;">CHOOSE INTERFACE</label>
            <div style="display: flex; gap: 10px; margin: 10px 0 25px;">
                <button class="pill active" style="flex: 1; padding: 10px; border-radius: 20px; border: 2px solid var(--marigold); background: var(--marigold); color: white;">English</button>
                <button class="pill" style="flex: 1; padding: 10px; border-radius: 20px; border: 2px solid var(--forest-green); background: transparent; color: var(--forest-green);">Hindi</button>
            </div>

            <label style="color: var(--forest-green); font-weight: bold; font-size: 0.8rem;">SELECT LEVEL</label>
            <div class="level-list" style="margin-top: 10px; display: flex; flex-direction: column; gap: 12px;">
                <div style="background: white; padding: 15px; border-radius: 15px; border-left: 5px solid var(--marigold); display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 1.5rem;">🌱</span>
                    <div>
                        <h4 style="color: var(--forest-green);">Beginner</h4>
                        <p style="font-size: 0.7rem; color: #666;">I am new to Awadhi.</p>
                    </div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 15px; border: 1px solid #ddd; display: flex; align-items: center; gap: 15px; opacity: 0.7;">
                    <span style="font-size: 1.5rem;">🌳</span>
                    <div>
                        <h4 style="color: var(--forest-green);">Heritage</h4>
                        <p style="font-size: 0.7rem; color: #666;">I grew up hearing it.</p>
                    </div>
                </div>
            </div>
        </div>

        <button class="start-btn" onclick="showScreen('home')">Shuru Karein</button>
    </div>
`,