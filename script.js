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
            'replaceWith': function() {
                this.currentTitlesShown = null;
                const els = arguments;

                fadeChildrenOutAndThen(el, function() {
                    for (let i = 0; i < els.length; ++i) {
                        el.append(els[i]);
                    }
                });
            },
            'showHelp': function() {
                this.replaceWith(
                    $('h2', 'Search for a title using the box to the right of the logo.'),
                    $('ul',
                        $('li', 'Type part of a title or type the title number.'),
                        $('li', 'Click ', $('span', { 'class': 'copy-link' }, '/title #'), ' to copy.'),
                        $('li', 'The links below the logo will show you titles in that category.')
                    ),
                    $('p', 'There might be a few hidden features, as well.')
                );
            },
            'showCredits': function() {
                this.replaceWith(
                    $('h2', 'Creator'),
                    $('p', 'Dedax'),
                    $('h2', 'Banner'),
                    $('p', 'Jacobmood'),
                    $('h2', 'Icons'),
                    $('p', 'EmojiOne 2.0'),
                    $('h2', 'Suggestions from'),
                    $('p', 'Elizalove, Levelup, Epilepsy, Imaginist')
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
                    if (this.currentTitlesShown.length === 0) {
                        return;
                    }

                    this.replaceWith($('p', 'Nobody here but us chickens...'));
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
                            'class': 'copy-span'
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
                            $('span', { 'class': 'title' }, titleText),
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

                    titleSection.append(
                        $('p',
                            { 'class': 'title-description' },
                            description
                        )
                    );

                    titleSections.push(titleSection);
                });

                this.currentTitlesShown = titles;

                fadeChildrenOutAndThen(el, function() {
                    for (let i = 0; i < titleSections.length; ++i) {
                        el.append(titleSections[i]);
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

            footer.removeChild(evertLink);
            return false;
        }

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
