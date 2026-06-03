/* =============================================
   HAMBURGUERIA - Main JavaScript
   ============================================= */

(function () {
    'use strict';

    /* ---- Splash Screen ---- */
    const splash = document.getElementById('splash');
    const body = document.body;

    function hideSplash() {
        if (!splash) return;
        splash.classList.add('hidden');
        body.classList.remove('splash-active');
        setTimeout(function () {
            splash.style.display = 'none';
        }, 700);
    }

    body.classList.add('splash-active');

    // Auto-dismiss after 2.5s
    var splashTimer = setTimeout(hideSplash, 2500);

    // Dismiss on user interaction
    function onSplashInteraction() {
        clearTimeout(splashTimer);
        hideSplash();
        document.removeEventListener('keydown', onSplashInteraction);
        document.removeEventListener('click', onSplashInteraction);
        document.removeEventListener('touchstart', onSplashInteraction);
    }
    document.addEventListener('keydown', onSplashInteraction);
    document.addEventListener('click', onSplashInteraction);
    document.addEventListener('touchstart', onSplashInteraction);


    /* ---- Navbar scroll behavior ---- */
    var navbar = document.getElementById('navbar');
    var lastScroll = 0;

    function onScroll() {
        var y = window.scrollY;
        if (y > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = y;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();


    /* ---- Mobile nav toggle ---- */
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            var isOpen = navMenu.classList.toggle('open');
            navToggle.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isOpen);
        });

        // Close menu on link click
        navMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navMenu.classList.remove('open');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }


    /* ---- Smooth scroll for anchor links ---- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                var offset = navbar.offsetHeight + 16;
                var top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });


    /* ---- Carousel ---- */
    var track = document.getElementById('carouselTrack');
    var prevBtn = document.querySelector('.carousel__btn--prev');
    var nextBtn = document.querySelector('.carousel__btn--next');
    var dotsContainer = document.querySelector('.carousel__dots');

    if (track && prevBtn && nextBtn) {
        var slides = track.querySelectorAll('.carousel__slide');
        var currentIndex = 0;
        var autoPlayInterval = null;

        function getVisibleSlides() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }

        function getTotalPages() {
            return Math.max(1, slides.length - getVisibleSlides() + 1);
        }

        function buildDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            var total = getTotalPages();
            for (var i = 0; i < total; i++) {
                var dot = document.createElement('button');
                dot.className = 'carousel__dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', 'Ir para slide ' + (i + 1));
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
                dot.dataset.index = i;
                dot.addEventListener('click', function () {
                    goToSlide(parseInt(this.dataset.index, 10));
                });
                dotsContainer.appendChild(dot);
            }
        }

        function updateDots() {
            if (!dotsContainer) return;
            dotsContainer.querySelectorAll('.carousel__dot').forEach(function (dot, i) {
                dot.classList.toggle('active', i === currentIndex);
                dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
            });
        }

        function goToSlide(index) {
            var maxIndex = getTotalPages() - 1;
            currentIndex = Math.max(0, Math.min(index, maxIndex));
            var slideWidth = slides[0].offsetWidth + 20; // 20 = gap
            track.style.transform = 'translateX(-' + (currentIndex * slideWidth) + 'px)';
            updateDots();
            updateButtons();
        }

        function updateButtons() {
            var maxIndex = getTotalPages() - 1;
            prevBtn.disabled = currentIndex <= 0;
            nextBtn.disabled = currentIndex >= maxIndex;
        }

        prevBtn.addEventListener('click', function () {
            goToSlide(currentIndex - 1);
            resetAutoPlay();
        });

        nextBtn.addEventListener('click', function () {
            goToSlide(currentIndex + 1);
            resetAutoPlay();
        });

        // Touch / swipe support
        var touchStartX = 0;
        var touchEndX = 0;

        track.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            var diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    goToSlide(currentIndex + 1);
                } else {
                    goToSlide(currentIndex - 1);
                }
                resetAutoPlay();
            }
        }, { passive: true });

        // Auto play
        function startAutoPlay() {
            autoPlayInterval = setInterval(function () {
                var maxIndex = getTotalPages() - 1;
                if (currentIndex >= maxIndex) {
                    goToSlide(0);
                } else {
                    goToSlide(currentIndex + 1);
                }
            }, 4000);
        }

        function resetAutoPlay() {
            clearInterval(autoPlayInterval);
            startAutoPlay();
        }

        // Pause on hover
        var carouselEl = document.querySelector('.carousel');
        if (carouselEl) {
            carouselEl.addEventListener('mouseenter', function () {
                clearInterval(autoPlayInterval);
            });
            carouselEl.addEventListener('mouseleave', function () {
                startAutoPlay();
            });
        }

        // Init
        buildDots();
        updateButtons();
        startAutoPlay();

        // Rebuild on resize
        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                currentIndex = 0;
                goToSlide(0);
                buildDots();
            }, 200);
        });
    }



    /* ---- Galeria Carousel (auto-play) ---- */
    (function () {
        var carousel = document.querySelector(".galeria__carousel");
        if (!carousel) return;

        var gTrack = carousel.querySelector(".galeria__track");
        var gSlides = carousel.querySelectorAll(".galeria__slide");
        var gDotsContainer = carousel.querySelector(".galeria__dots");
        var gCurrent = 0;
        var gAutoTimer = null;

        // Build dots
        function buildGDots() {
            if (!gDotsContainer) return;
            gDotsContainer.innerHTML = "";
            gSlides.forEach(function (_, i) {
                var dot = document.createElement("button");
                dot.className = "galeria__dot" + (i === 0 ? " galeria__dot--active" : "");
                dot.setAttribute("aria-label", "Ver foto " + (i + 1));
                dot.setAttribute("role", "tab");
                dot.dataset.index = i;
                dot.addEventListener("click", function () {
                    gGoTo(i);
                    gResetAuto();
                });
                gDotsContainer.appendChild(dot);
            });
        }

        function updateGDots() {
            if (!gDotsContainer) return;
            gDotsContainer.querySelectorAll(".galeria__dot").forEach(function (dot, i) {
                dot.classList.toggle("galeria__dot--active", i === gCurrent);
            });
        }

        function gGoTo(index) {
            gCurrent = ((index % gSlides.length) + gSlides.length) % gSlides.length;
            gTrack.style.transform = "translateX(-" + (gCurrent * 100) + "%)";
            updateGDots();
        }

        function gNext() {
            gGoTo(gCurrent + 1);
        }

        function gStartAuto() {
            gAutoTimer = setInterval(gNext, 3500);
        }

        function gResetAuto() {
            clearInterval(gAutoTimer);
            gStartAuto();
        }

        // Pause on hover
        carousel.addEventListener("mouseenter", function () {
            clearInterval(gAutoTimer);
        });
        carousel.addEventListener("mouseleave", function () {
            gStartAuto();
        });

        // Touch swipe
        var gTouchStartX = 0;
        carousel.addEventListener("touchstart", function (e) {
            gTouchStartX = e.changedTouches[0].screenX;
            clearInterval(gAutoTimer);
        }, { passive: true });
        carousel.addEventListener("touchend", function (e) {
            var diff = e.changedTouches[0].screenX - gTouchStartX;
            if (Math.abs(diff) > 50) {
                if (diff < 0) gGoTo(gCurrent + 1);
                else gGoTo(gCurrent - 1);
            }
            gStartAuto();
        }, { passive: true });

        buildGDots();
        gStartAuto();
    })();


    /* ---- Scroll Reveal ---- */
    var revealElements = document.querySelectorAll(
        '.testimonial-card, .burger-card, .visit-info__block, .section-header, .galeria__carousel'
    );

    revealElements.forEach(function (el) {
        el.classList.add('reveal');
    });

    function checkReveal() {
        var windowH = window.innerHeight;
        revealElements.forEach(function (el) {
            var top = el.getBoundingClientRect().top;
            if (top < windowH - 80) {
                el.classList.add('visible');
            }
        });
    }

    window.addEventListener('scroll', checkReveal, { passive: true });
    window.addEventListener('resize', checkReveal, { passive: true });

    // Trigger on load (after splash)
    setTimeout(checkReveal, 2600);


    /* ---- Keyboard accessibility for carousel ---- */
    if (track) {
        track.setAttribute('tabindex', '0');
        track.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') {
                goToSlide(currentIndex - 1);
                resetAutoPlay();
            } else if (e.key === 'ArrowRight') {
                goToSlide(currentIndex + 1);
                resetAutoPlay();
            }
        });
    }


    /* ===========================================================
       SCROLL-DRIVEN HERO BACKGROUND VIDEO
       The video plays as the user scrolls down.
       Once it reaches the end, the hero unlocks and the user
       can continue scrolling to the rest of the page naturally.
       =========================================================== */

    var canvas = document.getElementById('hero-canvas');
    var heroSection = document.getElementById('hero');
    var progressBar = document.querySelector('.hero__video-progress-bar');
    var scrollIndicator = document.querySelector('.hero__scroll-indicator');

    if (canvas && heroSection) {
        var ctx = canvas.getContext('2d');
        var totalFrames = 192;
        var frames = [];
        var videoProgress = 0;       // 0→1 how far the sequence has played
        var isLocked = false;         // true while hero is fixed/trapping scroll
        var videoComplete = false;
        var unlockingInProgress = false;
        var rafId = null;
        var targetProgress = 0;
        var currentFrameIndex = 0;

        // Cover logic for canvas drawing (like object-fit: cover)
        function drawImageCover(ctx, img, x, y, w, h) {
            var iw = img.width;
            var ih = img.height;
            if (!iw || !ih) return;
            var r = Math.max(w / iw, h / ih);
            var sw = w / r;
            var sh = h / r;
            var sx = (iw - sw) / 2;
            var sy = (ih - sh) / 2;
            ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
        }

        function drawCurrentFrame() {
            var img = frames[currentFrameIndex];
            if (!img) {
                img = frames[0];
            }
            if (img && img.complete) {
                drawImageCover(ctx, img, 0, 0, canvas.width, canvas.height);
            }
        }

        function resizeCanvas() {
            var dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.clientWidth * dpr;
            canvas.height = canvas.clientHeight * dpr;
            drawCurrentFrame();
        }
        window.addEventListener('resize', resizeCanvas);

        // Preload frames
        var firstFrame = new Image();
        firstFrame.src = 'assets/Hamburguer_opening_video_2026_frames/frame_000.png';
        firstFrame.onload = function() {
            frames[0] = firstFrame;
            resizeCanvas();
            onVideoReady(); // Trigger interactions once first frame is ready
        };

        // If first frame fails, still trigger so site doesn't lock
        firstFrame.onerror = function() {
            onVideoReady();
        };

        for (var i = 1; i < totalFrames; i++) {
            (function(index) {
                var img = new Image();
                var padded = String(index).padStart(3, '0');
                img.src = 'assets/Hamburguer_opening_video_2026_frames/frame_' + padded + '.png';
                img.onload = function() {
                    frames[index] = img;
                    // If we just loaded the current index, draw it
                    if (index === currentFrameIndex) {
                        drawCurrentFrame();
                    }
                };
            })(i);
        }

        // Smoothly seek using requestAnimationFrame
        function smoothSeek() {
            // Ease toward target
            var diff = targetProgress - videoProgress;
            if (Math.abs(diff) < 0.0005) {
                videoProgress = targetProgress;
            } else {
                videoProgress += diff * 0.15;
            }

            // Clamp
            videoProgress = Math.max(0, Math.min(1, videoProgress));

            // Map progress to frame index
            currentFrameIndex = Math.round(videoProgress * (totalFrames - 1));
            drawCurrentFrame();

            // Update progress bar
            if (progressBar) {
                progressBar.style.width = (videoProgress * 100) + '%';
            }

            // Check completion
            if (videoProgress >= 0.99 && !videoComplete) {
                videoComplete = true;
                videoProgress = 1;
                targetProgress = 1;
                currentFrameIndex = totalFrames - 1;
                drawCurrentFrame();
                if (progressBar) progressBar.style.width = '100%';
                unlockHero();
                return;
            }

            rafId = requestAnimationFrame(smoothSeek);
        }

        function startSmoothSeek() {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(smoothSeek);
        }

        var videoReady = false;
        function onVideoReady() {
            if (videoReady) return;
            videoReady = true;

            if (scrollIndicator) {
                scrollIndicator.classList.add('hero__scroll-indicator--waiting');
            }

            // Intercept wheel events to drive the frames
            window.addEventListener('wheel', onWheel, { passive: false });
            // Also intercept touch scroll on mobile
            window.addEventListener('touchmove', onTouchMove, { passive: false });
            // Intercept keyboard scroll
            window.addEventListener('keydown', onKeyDown);
        }

        function lockHero() {
            if (isLocked) return;
            isLocked = true;
            heroSection.classList.add('hero--video-playing');
            document.body.classList.add('hero-locked');

            // Add spacer to prevent page content from jumping
            var spacer = document.createElement('div');
            spacer.id = 'hero-spacer';
            spacer.style.height = heroSection.offsetHeight + 'px';
            heroSection.parentNode.insertBefore(spacer, heroSection.nextSibling);
        }

        function unlockHero() {
            if (!isLocked || unlockingInProgress) return;
            unlockingInProgress = true;

            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }

            isLocked = false;
            heroSection.classList.remove('hero--video-playing');
            heroSection.classList.add('hero--video-done');
            document.body.classList.remove('hero-locked');

            // Remove spacer
            var spacer = document.getElementById('hero-spacer');
            if (spacer) spacer.remove();

            if (scrollIndicator) {
                scrollIndicator.classList.remove('hero__scroll-indicator--waiting');
                scrollIndicator.classList.add('hero__scroll-indicator--done');
            }

            // Smooth scroll past hero to next section
            var nextSection = heroSection.nextElementSibling;
            // Skip spacer if it still exists
            while (nextSection && nextSection.id === 'hero-spacer') {
                nextSection = nextSection.nextElementSibling;
            }
            if (nextSection) {
                setTimeout(function () {
                    nextSection.scrollIntoView({ behavior: 'smooth' });
                    setTimeout(function () {
                        unlockingInProgress = false;
                    }, 800);
                }, 80);
            } else {
                unlockingInProgress = false;
            }
        }

        function advanceVideo(delta) {
            if (!videoReady || videoComplete) return;

            // Lock hero on first scroll interaction
            if (!isLocked) {
                lockHero();
                startSmoothSeek();
            }

            // delta > 0 = scrolling down (advance frames)
            // ~600 pixels of scroll ≈ full sequence play
            var step = delta / (window.innerHeight * 4);
            targetProgress = Math.max(0, Math.min(1, targetProgress + step));
        }

        function onWheel(e) {
            if (videoComplete || unlockingInProgress) return;

            var heroRect = heroSection.getBoundingClientRect();
            if (heroRect.bottom < 0 || heroRect.top > window.innerHeight) return;

            // Intercept scroll
            if (e.deltaY > 0) {
                e.preventDefault();
                advanceVideo(e.deltaY);
            } else if (e.deltaY < 0 && isLocked) {
                e.preventDefault();
                advanceVideo(e.deltaY);
            }
        }

        var lastTouchY = 0;
        function onTouchStart(e) {
            lastTouchY = e.touches[0].clientY;
        }

        function onTouchMove(e) {
            if (videoComplete || unlockingInProgress) return;

            var heroRect = heroSection.getBoundingClientRect();
            if (heroRect.bottom < 0 || heroRect.top > window.innerHeight) return;

            var touchY = e.touches[0].clientY;
            var delta = lastTouchY - touchY; // positive = scroll down
            lastTouchY = touchY;

            if (delta !== 0) {
                e.preventDefault();
                advanceVideo(delta * 3);
            }
        }

        function onKeyDown(e) {
            if (videoComplete || unlockingInProgress) return;

            var heroRect = heroSection.getBoundingClientRect();
            if (heroRect.bottom < 0 || heroRect.top > window.innerHeight) return;

            var scrollKeys = ['ArrowDown', 'Space', 'PageDown', 'ArrowUp', 'PageUp'];
            if (scrollKeys.indexOf(e.code) !== -1) {
                e.preventDefault();
                var delta = 0;
                if (e.code === 'ArrowDown' || e.code === 'Space') delta = 60;
                else if (e.code === 'PageDown') delta = 200;
                else if (e.code === 'ArrowUp') delta = -60;
                else if (e.code === 'PageUp') delta = -200;

                if (delta !== 0) {
                    advanceVideo(delta);
                }
            }
        }

        // Set up touch listeners
        window.addEventListener('touchstart', onTouchStart, { passive: true });

        // Prevent scroll while hero is locked
        window.addEventListener('scroll', function () {
            if (isLocked && !unlockingInProgress) {
                window.scrollTo(0, 0);
            }
        }, { passive: false });
    }

})();
