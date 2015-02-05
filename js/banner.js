/**
 * Creates a look-up table for palette colors from loaded stylesheets.
 * Searches stylesheets for selectors that start with ".palette-"
 * and retrieves their color and backgroundColor.
 * @returns {Object} Palette look-up table. Defaults to
    {
        normal: {
            backgroundColor: '#000',
            color: '#FFF'
        },
        highlight: {
            backgroundColor: '#000',
            color: '#FFF'
        },
        lowlight: {
            backgroundColor: '#000',
            color: '#FFF'
        },
        email: {
            borderColor: '#FFF',
            color: '#FFF'
        },
        twitter: {
            borderColor: '#FFF',
            color: '#FFF'
        },
        www: {
            borderColor: '#FFF',
            color: '#FFF'
        }
    }
 */
var createPalette = function() {
    var paletteProperties = ['backgroundColor', 'borderColor', 'color'];
    var palette = {};
    var defaultPalette = {
        normal: {
            backgroundColor: '#000',
            color: '#FFF'
        },
        highlight: {
            backgroundColor: '#000',
            color: '#FFF'
        },
        lowlight: {
            backgroundColor: '#000',
            color: '#FFF'
        },
        email: {
            borderColor: '#FFF',
            color: '#FFF'
        },
        twitter: {
            borderColor: '#FFF',
            color: '#FFF'
        },
        www: {
            borderColor: '#FFF',
            color: '#FFF'
        }
    };

    var getDefaultPalette = function(name, property) {
        if(defaultPalette[name]) {
            return defaultPalette[name][property];
        }
    };

    jQuery.each(document.styleSheets, function(_, styleSheet) {
        if(styleSheet) {
            var rules = styleSheet.cssRules || styleSheet.rules;
            if(rules) {
                jQuery.each(rules, function(_, rule) {
                    if(rule.selectorText && rule.selectorText.indexOf('.palette-') === 0) {
                        var paletteName = rule.selectorText.substr(9);
                        palette[paletteName] = {};
                        jQuery.each(paletteProperties, function(_, property) {
                            palette[paletteName][property] = rule.style[property] || getDefaultPalette(paletteName, property);
                        });
                    }
                });
            }
        }
    });
    return palette;
};


var _tags = {};
/**
 * Returns true if elements of the given tag support the named event.
 * @param {String} tag The name of the tag, like "div".
 * @param {String} event The name of the event, like "onclick".
 * @return {Boolean} True if the element supports the event.
 */
var isEventSupported = function(tag, event) {
    if(!_tags[tag]) {
        _tags[tag] = document.createElement(tag);
    }
    var el = _tags[tag];
    el.setAttribute(event, '');
    return typeof el[event] == 'function';
};


/**
 * Initializes highlighting/unhighlighting of banner elements.
 */
var initBanner = function() {
    var palette = createPalette();
    var classes = ['twitter', 'email', 'www'];

    var isTouchSupported = isEventSupported('div', 'ontouchstart');

    /*
     * Highlight the selected region when the link is hovered with the mouse.
     */
    var fadeInDuration = 250;
    var fadeOutDuration = 150;

    var allLinks = jQuery('.banner a.link');
    var allTds = jQuery('.banner td');
    var allFills = jQuery('.banner .fill');
    var allBorders = jQuery('.banner .border');
    var allCells = jQuery('.banner .cell');

    var unhighlightBanner = function() {
        allTds.removeClass('highlight');
        allFills.stop().animate({'opacity': '1'}, fadeOutDuration);
        allBorders.stop().animate({'opacity': '1'}, fadeOutDuration);
        allTds.stop().animate({'color': palette.normal.color}, fadeOutDuration);
        if(!(jQuery.browser.msie && jQuery.browser.version < 10)) {
            allCells.stop().animate({'opacity': '1'}, fadeOutDuration);
        }
        if(isTouchSupported) {
            allLinks.removeAttr('href');
        }
        return false;
    };

    if(isTouchSupported) {
        jQuery('.banner a.link').each(function() {
            this.setAttribute('data-href', this.href);
            this.removeAttribute('href');
        });

        jQuery('body').on('touchstart', function(event) {
            if(event.originalEvent.touches && event.originalEvent.touches.length === 1) {
                if(jQuery(event.target).parents('.highlight').length === 0) {
                    unhighlightBanner();
                }
            }
        });
    } else {
        jQuery('.banner').mouseleave(unhighlightBanner);
        allTds.mouseenter(function(event) {
            if(!jQuery(event.delegateTarget).hasClass('highlight')) {
                unhighlightBanner();
            }
        });
    }

    jQuery.each(classes, function(i, cls) {
        var tds = jQuery('.banner td.'+cls);
        var otherTds = jQuery('.banner td').not('.banner td.'+cls);
        var cells = jQuery('.banner .'+cls+' .cell');
        var otherCells = jQuery('.banner .cell').not('.banner .'+cls+' .cell');
        var fills = jQuery('.banner .'+cls+'-fill');
        var otherFills = jQuery('.banner .'+cls+' .'+classes[(i + 1) % 3]+'-fill, '+
                                '.banner .'+cls+' .'+classes[(i + 2) % 3]+'-fill');
        var borders = jQuery('.banner .'+cls+'-border');
        var otherBorders = jQuery('.banner .'+cls+' .'+classes[(i + 1) % 3]+'-border, '+
                                  '.banner .'+cls+' .'+classes[(i + 2) % 3]+'-border');

        var highlightBanner = function() {
            tds.addClass('highlight');
            otherTds.removeClass('highlight');
            borders.css('z-index', '-1');
            otherBorders.css('z-index', '-2');

            fills.stop().animate({'opacity': '1'}, fadeInDuration);
            otherFills.stop().animate({'opacity': '0'}, fadeInDuration);
            allBorders.stop().animate({'opacity': '1'}, fadeInDuration);
            otherBorders.stop().animate({'opacity': '0'}, fadeInDuration);
            tds.stop().animate({'color': palette.highlight.color}, fadeInDuration);
            otherTds.stop().animate({'color': palette.lowlight.color}, fadeInDuration);
            if(!(jQuery.browser.msie && jQuery.browser.version < 10)) {
                cells.stop().animate({'opacity': '1'}, fadeInDuration);
                otherCells.stop().animate({'opacity': '0.25'}, fadeInDuration);
            }
            return false;
        };

        if(isTouchSupported) {
            tds
                .not('.banner .'+classes[(i + 1) % 3])
                .not('.banner .'+classes[(i + 2) % 3])
                .on('touchstart', function(event) {
                if(event.originalEvent.touches && event.originalEvent.touches.length === 1) {
                    if(jQuery(event.target).parents('.highlight').length === 0) {
                        highlightBanner();
                    } else {
                        jQuery('.banner a.link').not('.banner a.'+cls+'-link').removeAttr('href');
                        jQuery('.banner a.'+cls+'-link').each(function() {
                            this.setAttribute('href', this.getAttribute('data-href'));
                        });
                    }
                }
            });
        } else {
            tds
                .not('.banner .'+classes[(i + 1) % 3])
                .not('.banner .'+classes[(i + 2) % 3])
                .mouseenter(highlightBanner);
        }
    });
};


/*
 * Only run javascript for browsers that are not IE 6
 */
if(!(jQuery.browser.msie && jQuery.browser.version < 7)) {
    jQuery(document).ready(initBanner);
}
