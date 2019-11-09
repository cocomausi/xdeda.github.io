(function() {
    function $ify(el) {
        if (!el) {
            return el;
        }

        el.appendText = function(text) {
            const lines = text.split(/\r?\n/);
            let first = true;

            lines.forEach(function(line) {
                if (first) {
                    first = false;
                } else {
                    el.appendChild(document.createElement('br'));
                }

                el.appendChild(document.createTextNode(line));
            });

            return el;
        };

        el.append = function() {
            for (let i = 0; i < arguments.length; ++i) {
                if (typeof(arguments[i]) === 'string') {
                    el.appendText(arguments[i]);
                } else {
                    el.appendChild(arguments[i]);
                }
            }

            return el;
        };

        el.clearChildren = function() {
            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }

            return el;
        };

        return el;
    }

    // $(arg, [attributes,] [child, [child, [...]]])
    function $(arg) {
        if (arg.slice(0, 1) == '.') {
            return Array.from(document.getElementsByClassName(arg.slice(1))).map($ify);
        } else if (arg.slice(0, 1) == '#') {
            return $ify(document.getElementById(arg.slice(1)));
        }

        const el = document.createElement(arg);

        for (let i = 1; i < arguments.length; ++i) {
            const obj = arguments[i];

            if (obj) {
                if ((typeof(obj) === 'object') && !(obj instanceof Element) && !obj.append) {
                    Object.keys(obj).forEach(function(key) {
                        el.setAttribute(key, obj[key]);
                    });
                } else {
                    el.append(obj);
                }
            }
        }

        return el;
    }

    function arraysEqual(a, b) {
        if (!a && !b) {
            return true;
        }

        if (!a || !b || a.length !== b.length) {
            return false;
        }

        for (let i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) {
                return false;
            }
        }

        return true;
    }

    function createZalgoText(length) {
        // https://jsfiddle.net/JKirchartz/wwckP/
        const zalgoChars = [
            // Above
            [
                '\u030d', // ̍
                '\u030e', // ̎
                '\u0304', // ̄
                '\u0305', // ̅
                '\u033f', // ̿
                '\u0311', // ̑
                '\u0306', // ̆
                '\u0310', // ̐
                '\u0352', // ͒
                '\u0357', // ͗
                '\u0351', // ͑
                '\u0307', // ̇
                '\u0308', // ̈
                '\u030a', // ̊
                '\u0342', // ͂
                '\u0343', // ̓
                '\u0344', // ̈́
                '\u034a', // ͊
                '\u034b', // ͋
                '\u034c', // ͌
                '\u0303', // ̃
                '\u0302', // ̂
                '\u030c', // ̌
                '\u0350', // ͐
                '\u0300', // ̀
                '\u0301', // ́
                '\u030b', // ̋
                '\u030f', // ̏
                '\u0312', // ̒
                '\u0313', // ̓
                '\u0314', // ̔
                '\u033d', // ̽
                '\u0309', // ̉
                '\u0363', // ͣ
                '\u0364', // ͤ
                '\u0365', // ͥ
                '\u0366', // ͦ
                '\u0367', // ͧ
                '\u0368', // ͨ
                '\u0369', // ͩ
                '\u036a', // ͪ
                '\u036b', // ͫ
                '\u036c', // ͬ
                '\u036d', // ͭ
                '\u036e', // ͮ
                '\u036f', // ͯ
                '\u033e', // ̾
                '\u035b', // ͛
                '\u0346', // ͆
                '\u031a', // ̚
                ''
            ],
            // Below
            [
                '\u0316', // ̖
                '\u0317', // ̗
                '\u0318', // ̘
                '\u0319', // ̙
                '\u031c', // ̜
                '\u031d', // ̝
                '\u031e', // ̞
                '\u031f', // ̟
                '\u0320', // ̠
                '\u0324', // ̤
                '\u0325', // ̥
                '\u0326', // ̦
                '\u0329', // ̩
                '\u032a', // ̪
                '\u032b', // ̫
                '\u032c', // ̬
                '\u032d', // ̭
                '\u032e', // ̮
                '\u032f', // ̯
                '\u0330', // ̰
                '\u0331', // ̱
                '\u0332', // ̲
                '\u0333', // ̳
                '\u0339', // ̹
                '\u033a', // ̺
                '\u033b', // ̻
                '\u033c', // ̼
                '\u0345', // ͅ
                '\u0347', // ͇
                '\u0348', // ͈
                '\u0349', // ͉
                '\u034d', // ͍
                '\u034e', // ͎
                '\u0353', // ͓
                '\u0354', // ͔
                '\u0355', // ͕
                '\u0356', // ͖
                '\u0359', // ͙
                '\u035a', // ͚
                '\u0323', // ̣
                ''
            ],
            // Middle
            [
                '\u0315', // ̕
                '\u031b', // ̛
                '\u0340', // ̀
                '\u0341', // ́
                '\u0358', // ͘
                '\u0321', // ̡
                '\u0322', // ̢
                '\u0327', // ̧
                '\u0328', // ̨
                '\u0334', // ̴
                '\u0335', // ̵
                '\u0336', // ̶
                '\u034f', // ͏
                '\u035c', // ͜
                '\u035d', // ͝
                '\u035e', // ͞
                '\u035f', // ͟
                '\u0360', // ͠
                '\u0362', // ͢
                '\u0338', // ̸
                '\u0337', // ̷
                '\u0361', // ͡
                '\u0489', // ҉
                ''
            ]
        ];

        // Returns a random integer in the range [0, n)
        function randBelow(n) {
            return Math.floor(Math.random() * n);
        }

        let zalgoText = '';

        for (let i = 0; i < length; ++i) {
            const charType = randBelow(zalgoChars.length);
            const charIdx = randBelow(zalgoChars[charType].length);
            zalgoText += zalgoChars[charType][charIdx];
        }

        return zalgoText;
    }

    // Split all child text nodes recursively into text nodes of length 1
    function splitNodeText(node) {
        for (let i = node.childNodes.length - 1; i >= 0; --i) {
            let childNode = node.childNodes[i];

            if (childNode.nodeType === Node.TEXT_NODE) {
                while (childNode.nodeValue.length > 1) {
                    childNode = childNode.splitText(1);
                }
            } else {
                splitNodeText(childNode);
            }
        }
    }

    function zalgoifyNode(node) {
        const ZALGO_DELAY = 66;

        const zalgoIterations = Math.floor(Math.random() * 7) + 6;

        if (node.classList.contains('undergoing-zalgo')) {
            return;
        }

        const zalgoSpans = [];

        for (let i = node.childNodes.length - 1; i >= 0; --i) {
            const childNode = node.childNodes[i];

            if (childNode.nodeType === Node.TEXT_NODE) {
                const zalgoSpan = $(
                    'span',
                    { 'class': 'zalgo-text' }
                );

                zalgoSpans.push(zalgoSpan);

                node.insertBefore(
                    zalgoSpan,
                    childNode
                );
            } else {
                zalgoifyNode(childNode);
            }
        }

        function updateZalgoSpans(n) {
            node.classList.add('undergoing-zalgo');

            if (n === 0) {
                zalgoSpans.forEach(function(zalgoSpan) {
                    if (zalgoSpan.parentNode) {
                        zalgoSpan.parentNode.removeChild(zalgoSpan);
                    }
                });

                node.classList.remove('undergoing-zalgo');

                return;
            }

            zalgoSpans.forEach(function(zalgoSpan) {
                zalgoSpan.textContent = createZalgoText(Math.floor(Math.random() * 5));
            });

            setTimeout(function() {
                updateZalgoSpans(n - 1);
            }, ZALGO_DELAY);
        }

        updateZalgoSpans(zalgoIterations);
    }

    function enableZalgoOnInteraction(els) {
        for (let i = 0; i < els.length; ++i) {
            const el = els[i];

            splitNodeText(el);

            el.onmouseover = function() {
                zalgoifyNode(el);
            };

            // Don't overwite existing onclick handlers
            el.addEventListener('click', function() {
                zalgoifyNode(el);
            })
        }
    }

    function zalgoifyContent() {
        enableZalgoOnInteraction(document.querySelectorAll('.zalgoable'));
    }

    function enableZalgo(content) {
        content.enableZalgo();

        // Enable zalgo on non-content elements
        enableZalgoOnInteraction(
            document.querySelectorAll('#nav a, footer h2, footer a')
        );

        zalgoifyContent();
    }

    function getHash() {
        return decodeURI(location.hash.slice(1).toLowerCase());
    }

    // Fade all children of el out and then run callback
    function fadeChildrenOutAndThen(el, callback) {
        if (el.childNodes.length === 0) {
            callback();
            return;
        }

        // Fade out animation length is constant, so it's fine to just call it on the first element's animationend
        let callbackSet = false;

        for (let i = 0; i < el.childNodes.length; ++i) {
            if (!callbackSet) {
                el.childNodes[i].addEventListener('animationend', function() {
                    el.clearChildren();
                    callback();
                });

                callbackSet = true;
            }

            el.childNodes[i].classList.add('fade-out');
        }
    }

    function setSecretMessage(message) {
        const span = $('#secret-message');

        if (message.length > 0) {
            span.clearChildren();
            span.append(' | ' + message);
        } else {
            span.clearChildren();
        }
    }

    function ContentContainer(el) {
        const contentContainer = {
            'catModeOn': false,
            'currentTitlesShown': null,
            'el': el,
            'titles': [],
            'zalgoEnabled': false,
            'enableZalgo': function() {
                this.zalgoEnabled = true;
            },
            'replaceWith': function() {
                this.currentTitlesShown = null;
                const els = arguments;

                fadeChildrenOutAndThen(el, function() {
                    for (let i = 0; i < els.length; ++i) {
                        el.append(els[i]);
                    }

                    if (contentContainer.zalgoEnabled) {
                        zalgoifyContent();
                    }
                });
            },
            'showHelp': function() {
                this.replaceWith(
                    $('h2', { 'class': 'zalgoable' }, 'Search for a title using the box to the right of the logo.'),
                    $('ul',
                        $('li', { 'class': 'zalgoable' }, 'Type part of a title or type the title number.'),
                        $('li', { 'class': 'zalgoable' }, 'Click ', $('span', { 'class': 'copy-link' }, '/title #'), ' to copy.'),
                        $('li', { 'class': 'zalgoable' }, 'The links below the logo will show you titles in that category.')
                    ),
                    $('p', { 'class': 'zalgoable' }, 'There might be a few hidden features, as well.')
                );
            },
            'showCredits': function() {
                this.replaceWith(
                    $('h2', { 'class': 'zalgoable' }, 'Creator'),
                    $('p', { 'class': 'zalgoable' }, 'Dedax'),
                    $('h2', { 'class': 'zalgoable' }, 'Banner'),
                    $('p', { 'class': 'zalgoable' }, 'Jacobmood'),
                    $('h2', { 'class': 'zalgoable' }, 'Icons'),
                    $('p', { 'class': 'zalgoable' }, 'EmojiOne 2.0'),
                    $('h2', { 'class': 'zalgoable' }, 'Suggestions from'),
                    $('p', { 'class': 'zalgoable' }, 'Elizalove, Levelup, Epilepsy, Imaginist')
                );
            },
            'showAllTitles': function() {
                this.showTitles(this.titles);
            },
            'showRandomTitle': function() {
                const idx = Math.floor(Math.random() * this.titles.length);
                this.showTitles(this.titles.slice(idx, idx + 1));
            },
            'showMatches': function(query) {
                query = query.toLowerCase().trim();

                if (this.secrets && this.secrets[query]) {
                    setSecretMessage(this.secrets[query]);
                } else {
                    setSecretMessage('');
                }

                if (query === atob('YnV0dHM=')) {
                    document.body.classList.add('zoop');
                } else if (query === atob('YW15')) {
                    if (!$('#m')) {
                        this.replaceWith(
                            $('span', { 'id': 'm' }, $('span', { 'id': 'n' }))
                        );
                    }
                    return;
                }

                const matches = this.titles.filter(function(title) {
                    return (
                        title.name.toLowerCase().includes(query) ||
                        (title.altName && title.altName.toLowerCase().includes(query)) ||
                        title.id.toString().includes(query)
                    );
                });

                this.showTitles(matches);
            },
            'showTag': function(tag) {
                const matches = this.titles.filter(function(title) {
                    return title.tags.includes(tag);
                });

                this.showTitles(matches);
            },
            'showTitles': function(titles, forceRefresh) {
                if (titles.length === 0) {
                    if (this.currentTitlesShown && this.currentTitlesShown.length === 0) {
                        return;
                    }

                    this.replaceWith($('p', { 'class': 'zalgoable' }, 'Nobody here but us chickens...'));
                    this.currentTitlesShown = [];
                    return;
                }

                if (arraysEqual(titles, this.currentTitlesShown) && !forceRefresh) {
                    return;
                }

                const titleSections = [];

                titles.forEach(function(title) {
                    const titleSection = $('section');
                    const copySpan = $('span',
                        {
                            'class': 'copy-span zalgoable'
                        },
                        $('a',
                            {
                                'class': 'copy-link',
                                'href': '#',
                                'title': 'Click to copy'
                            },
                            '/title ' + title.id
                        )
                    );

                    copySpan.onclick = (function(copySpan) {
                        return function() {
                            // https://stackoverflow.com/a/987376
                            const rng = document.createRange();
                            rng.selectNodeContents(copySpan);

                            const sel = window.getSelection();
                            sel.removeAllRanges();
                            sel.addRange(rng);

                            document.execCommand('copy');

                            sel.removeAllRanges();

                            const popup = $('span',
                                {
                                    'class': 'popup'
                                },
                                'Copied'
                            );

                            popup.onanimationend = function() {
                                popup.parentNode.removeChild(popup);
                            };

                            if (contentContainer.zalgoEnabled) {
                                splitNodeText(popup);
                                zalgoifyNode(popup);
                            }

                            copySpan.appendChild(popup);

                            return false;
                        };
                    })(copySpan, title.id);

                    let titleText = title.name;

                    if (title.altName) {
                        titleText = title.altName + ' / ' + titleText;
                    }

                    if (contentContainer.catModeOn) {
                        titleText = titleText.replace('Mouse', 'Cat')
                            .replace('mouse', 'cat')
                            .replace('Maus', 'Katze')
                            .replace('maus', 'katze')
                            .replace('Souris', 'Chat')
                            .replace('souris', 'chat');
                    }

                    titleSection.append(
                        $('p',
                            $('span', { 'class': 'title zalgoable' }, titleText),
                            ' ',
                            copySpan
                        )
                    );

                    let description;

                    if (title.id === 138) {
                        description = $('a',
                            {
                                'href': 'http://www.youtube.com/watch?v=dQw4w9WgXcQ'
                            },
                            title.description
                        );
                    } else {
                        description = title.description;
                    }

                    titleSection.append($(
                        'p',
                        { 'class': 'title-description zalgoable' },
                        description
                    ));

                    titleSections.push(titleSection);
                });

                this.currentTitlesShown = titles;

                fadeChildrenOutAndThen(el, function() {
                    for (let i = 0; i < titleSections.length; ++i) {
                        el.append(titleSections[i]);
                    }

                    if (contentContainer.zalgoEnabled) {
                        zalgoifyContent();
                    }
                });
            },
            'toggleCatMode': function() {
                this.catModeOn = !this.catModeOn;

                if (this.currentTitlesShown) {
                    this.showTitles(this.currentTitlesShown, true);
                }
            }
        };

        return contentContainer;
    }

    function navigate(content) {
        const hash = getHash();

        if (hash === 'credits') {
            content.showCredits();
        } else if (hash === 'all') {
            content.showAllTitles();
        } else if (hash === 'random') {
            content.showRandomTitle();
        } else if (hash.slice(0, 4) === 'tag/') {
            const tag = hash.slice(4);

            content.showTag(tag);
        } else {
            content.showHelp();
        }
    }

    function createFooter(content) {
        const footer = $('#footer');

        footer.append($('h2', 'Super cool links', $('span', { 'id': 'secret-message' } )));

        $('#header-link').onclick = function() {
            if (getHash() === 'help') {
                content.showHelp();
            }
        };

        const helpLink = $('a', { 'href': '#help' }, 'Help');
        const creditsLink = $('a', { 'href': '#credits' }, 'Credits');

        helpLink.onclick = function() {
            if (getHash() === 'help') {
                content.showHelp();
            }
        };

        creditsLink.onclick = function() {
            if (getHash() === 'credits') {
                content.showCredits();
            }
        };

        const links = $('ul');
        links.append($('li', $('a', { 'href': 'https://transformice.com/' }, 'transformice.com')));
        links.append($('li', $('a', { 'href': 'https://instagram.com/jegerniclas/' }, 'Creator\'s Instagram')));
        links.append($('li', helpLink));
        links.append($('li', creditsLink));
        links.append($('li', $('a', { 'href': 'https://github.com/xDeda/xdeda.github.io' }, 'GitHub Repository')));

        footer.append(links);

        // Add cat mode button
        const mouseIcon = 'mouse.png';
        const catIcon = 'cat.png';

        const catButton = $('img',
            {
                'src': mouseIcon,
                'alt': 'cat mode',
                'width': 32,
                'height': 32
            }
        );

        const catLink = $('a',
            {
                'href': '#',
                'id': 'cat-link'
            },
            catButton
        );

        catLink.onclick = function() {
            content.toggleCatMode();

            if (content.catModeOn) {
                catButton.src = catIcon;
            } else {
                catButton.src = mouseIcon;
            }

            return false;
        };

        footer.appendChild(catLink);

        // Add eversion link
        const evertLink = $('a',
            {
                'href': '#',
                'id': 'evert-link'
            },
            'Evert'
        );

        evertLink.onclick = function() {
            document.body.classList.add('evert');

            // Only want to animate hyperlinks in #content when eversion begins
            const pageBorder = $('#page-border');
            pageBorder.addEventListener('animationend', function() {
                document.body.classList.remove('evert-begin');
            });
            document.body.classList.add('evert-begin');

            enableZalgo(content);

            footer.removeChild(evertLink);
            return false;
        };

        footer.appendChild(evertLink);
    }

    function loadData(content, listedTags) {
        const header = $('#header');
        const nav = $('#nav');

        // Add search box
        const searchInput = $('input',
            {
                'id': 'search',
                'type': 'text',
                'placeholder': 'search for title'
            }
        );

        let searchTimeoutId = null;

        function queueSearch(query) {
            clearTimeout(searchTimeoutId);

            searchTimeoutId = setTimeout(function() {
                content.showMatches(query);
            }, 250);
        }

        searchInput.addEventListener('keyup', function(event) {
            queueSearch(searchInput.value);
        });

        searchInput.addEventListener('paste', function() {
            queueSearch(searchInput.value);
        });

        header.insertBefore(searchInput, header.childNodes[2]);

        // Add links to tags
        function addLink(text, hash, onclick) {
            const link = $('a', { 'href': '#' + hash }, text);
            link.onclick = onclick;
            nav.append($('li', link));
        }

        addLink('All Titles', 'all', content.showAllTitles.bind(content));
        addLink('Random', 'random', content.showRandomTitle.bind(content));

        listedTags.forEach(function(tag) {
            addLink(tag, 'tag/' + tag.toLowerCase(), (function() {
                return function() {
                    content.showTag(tag.toLowerCase());
                };
            })(tag));
        });

        if (getHash() === '') {
            content.showHelp();
        } else {
            navigate(content);
        }
    }

    function init() {
        const content = ContentContainer($('#content'));

        window.onhashchange = function() {
            navigate(content);
        };

        content.replaceWith($('p', 'Loading...'));

        function showErrorMessage() {
            content.replaceWith(
                $('p', 'An error occurred while attempting to retrieve the titles. Please try refreshing the page.')
            );
        }

        createFooter(content);

        // Load title data
        const req = new XMLHttpRequest();

        req.onload = function() {
            if (req.status < 400) {
                let configParsed = false;
                let listedTags = [];

                try {
                    const config = JSON.parse(req.response);

                    content.titles = config.titles;
                    listedTags = config.listedTags;
                    content.secrets = config.secrets;

                    configParsed = true;
                } catch (e) {
                    showErrorMessage();
                }

                if (configParsed) {
                    loadData(content, listedTags);
                }
            } else {
                showErrorMessage();
            }
        };

        req.onerror = showErrorMessage;

        req.open('GET', 'config.json');
        req.send();
    }

    window.onload = init;
})();
