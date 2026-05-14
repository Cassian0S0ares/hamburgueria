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


    /* ---- Scroll Reveal ---- */
    var revealElements = document.querySelectorAll(
        '.testimonial-card, .burger-card, .visit-info__block, .section-header'
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

 /* ---- Scroll-driven hero video ---- */
 var heroVideo = document.querySelector('.hero__burger-video');
 var heroSection = document.getElementById('hero');
 var progressBar = document.querySelector('.hero__video-progress-bar');
 var scrollIndicator = document.querySelector('.hero__scroll-indicator');

 if (heroVideo && heroSection) {
 var videoReady = false;
 var videoDuration = 0;
 var videoProgress = 0;      // 0→1 how far the video has played
 var isLocked = false;        // true while hero is fixed/trapping scroll
 var videoComplete = false;
 var scrollLockTimeout = null; // flag to temporarily allow scroll during unlock

 function onVideoReady() {
 if (videoReady) return;
 videoReady = true;
 videoDuration = heroVideo.duration;

 heroVideo.pause();
 heroVideo.currentTime = 0;

 if (scrollIndicator) {
 scrollIndicator.classList.add('hero__scroll-indicator--waiting');
 }

 // Intercept wheel events to drive the video
 window.addEventListener('wheel', onWheel, { passive: false });
 // Also intercept touch scroll on mobile
 window.addEventListener('touchmove', onTouchMove, { passive: false });
 // Intercept keyboard scroll (arrow keys, space, page down)
 window.addEventListener('keydown', onKeyDown);
 }

 function lockHero() {
 if (isLocked) return;
 isLocked = true;
 heroSection.classList.add('hero--video-playing');
 document.body.classList.add('hero-locked');

 // Add spacer to prevent page content from jumping up
 // when hero goes position:fixed (out of flow)
 var spacer = document.createElement('div');
 spacer.id = 'hero-spacer';
 spacer.style.height = heroSection.offsetHeight + 'px';
 heroSection.parentNode.insertBefore(spacer, heroSection.nextSibling);
 }

 function unlockHero() {
 if (!isLocked) return;

 // Briefly allow scrolling for the transition
 scrollLockTimeout = true;

 isLocked = false;
 heroSection.classList.remove('hero--video-playing');
 heroSection.classList.add('hero--video-done');
 document.body.classList.remove('hero-locked');

 // Remove spacer
 var spacer = document.getElementById('hero-spacer');
 if (spacer) spacer.remove();

 // Scroll past the hero to the next section
 var nextSection = heroSection.nextElementSibling;
 if (nextSection) {
 setTimeout(function() {
 nextSection.scrollIntoView({ behavior: 'smooth' });
 // Re-enable scroll lock prevention after transition
 setTimeout(function() {
 scrollLockTimeout = null;
 }, 1000);
 }, 50);
 } else {
 scrollLockTimeout = null;
 }

 if (scrollIndicator) {
 scrollIndicator.classList.remove('hero__scroll-indicator--waiting');
 scrollIndicator.classList.add('hero__scroll-indicator--done');
 }
 }

 function advanceVideo(delta) {
 if (!videoReady || !videoDuration || videoComplete) return;

 // Lock hero on first interaction
 if (!isLocked) {
 lockHero();
 }

 // delta > 0 = scrolling down (advance video)
 // Normalize delta: ~250 pixels of scroll ≈ 1% of video (slower = more fluid)
 var step = (delta / 750) * (1 / videoDuration);
 videoProgress = Math.min(Math.max(videoProgress + step, 0), 1);

 var targetTime = videoProgress * videoDuration;
 if (Math.abs(heroVideo.currentTime - targetTime) > 0.03) {
 heroVideo.currentTime = targetTime;
 }

 // Update progress bar
 if (progressBar) {
 progressBar.style.width = (videoProgress * 100) + '%';
 }

 // Video complete — unlock and let user scroll
 if (videoProgress >= 1 && !videoComplete) {
 videoComplete = true;
 unlockHero();
 }
 }

 function onWheel(e) {
 // Only intercept if hero is visible and video not done
 if (videoComplete) return;

 var heroRect = heroSection.getBoundingClientRect();
 // If hero is not in view, don't intercept
 if (heroRect.bottom < 0 || heroRect.top > window.innerHeight) return;

 // Only intercept scroll-down events while video is playing
 if (e.deltaY > 0) {
 e.preventDefault();
 advanceVideo(e.deltaY);
 }
 // Allow scroll up only if video hasn't started or to go back in video
 else if (e.deltaY < 0 && isLocked) {
 e.preventDefault();
 advanceVideo(e.deltaY); // negative delta rewinds video
 }
 }

 var lastTouchY = 0;
 function onTouchStart(e) {
 lastTouchY = e.touches[0].clientY;
 }
 function onTouchMove(e) {
 if (videoComplete) return;

 var heroRect = heroSection.getBoundingClientRect();
 if (heroRect.bottom < 0 || heroRect.top > window.innerHeight) return;

 var touchY = e.touches[0].clientY;
 var delta = lastTouchY - touchY; // positive = scroll down
 lastTouchY = touchY;

 if (delta !== 0) {
 e.preventDefault();
 advanceVideo(delta * 3); // amplify touch movement
 }
 }

 function onKeyDown(e) {
 if (videoComplete) return;

 var heroRect = heroSection.getBoundingClientRect();
 if (heroRect.bottom < 0 || heroRect.top > window.innerHeight) return;

 var scrollKeys = ['ArrowDown', 'Space', 'PageDown', 'ArrowUp', 'PageUp', 'Home', 'End'];
 if (scrollKeys.indexOf(e.code) !== -1) {
 e.preventDefault();
 var delta = 0;
 if (e.code === 'ArrowDown' || e.code === 'Space') delta = 50;
 else if (e.code === 'PageDown') delta = 200;
 else if (e.code === 'ArrowUp') delta = -50;
 else if (e.code === 'PageUp') delta = -200;
 else if (e.code === 'Home') { videoProgress = 0; delta = 0; }
 else if (e.code === 'End') { videoProgress = 1; delta = 0; }

 if (delta !== 0) {
 advanceVideo(delta);
 } else {
 // Home/End: jump directly
 heroVideo.currentTime = videoProgress * videoDuration;
 if (progressBar) progressBar.style.width = (videoProgress * 100) + '%';
 if (videoProgress >= 1 && !videoComplete) {
 videoComplete = true;
 unlockHero();
 }
 }
 }
 }

 // Set up touch listeners
 window.addEventListener('touchstart', onTouchStart, { passive: true });

 // Prevent scroll while hero is locked
 window.addEventListener('scroll', function() {
 if (isLocked && !scrollLockTimeout) {
 window.scrollTo(0, 0);
 }
 }, { passive: false });

 // Wait for video to be ready
 if (heroVideo.readyState >= 1) {
 onVideoReady();
 } else {
 heroVideo.addEventListener('loadedmetadata', onVideoReady, { once: true });
 heroVideo.addEventListener('durationchange', onVideoReady, { once: true });
 setTimeout(function() {
 if (!videoReady && heroVideo.readyState >= 1) onVideoReady();
 }, 1000);
 }
 }

})();
