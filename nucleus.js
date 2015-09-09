
// helpers

// Makes a random string of the specified size
// length: The size of the string to make
function makeRandomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

// Executes an Ajax Post using JQuery (expects default ResponseObject)
// url: The url to post
// data: The data to post
// onSuccess: Function to be called if sucess is achieved
// onError: Function to be called if shit happens
function nukePost(url, data, onSuccess, onError) {
    $.ajax({
        type: 'POST',
        url: url,
        data: data,
        success: function (result) {
            if (result.returnCode == 0) {
                onSuccess(result);
            } else {
                onError(result);
            }
        },
        error: function (err) {
            onError(err);
        }
    });
}

// Checks if an object is null, undefined, empty ("") or NaN
function isnull(obj) {
    return obj == null || obj == undefined || obj === "";
}

// Replaces a character at the specified position by the specified string/char
// index: The index of the character to remove and start replacting
// character: The character/string to replace at the index
String.prototype.replaceAt = function (index, character) {
    return this.substr(0, index) + character + this.substr(index + character.length);
}

var cpfMask = "999.999.999-99";
var dateMask = "dd/mm/yyyy";

// Converts a String to a Boolean correctly
// string: The string to convert to boolean. Acceped values:
//          true, yes, 1 for true
//          false, no, 0 for false
// Trivia: JavaScript default conversion converts 'anything' that isn't empty to true, 
// so: var str = (Boolean)'false'; gets the result 'true';
function nukeStringToBoolean(string) {
    if (typeof string === 'string' || string instanceof String) {
        switch (string.toLowerCase().trim()) {
            case "true": case "yes": case "1": return true;
            case "false": case "no": case "0": case null: return false;
            default: return Boolean(string);
        }
    }
    return string;
}

// Validates if the provided string is an email
// email: String to test to see if it's an email
function nukeValidateEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

// Gets all the URL variables in an array
function nukeGetUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

// Formats a date to a specific format. Parses the date if it's not a Date object
// date: The date object/string to format
// format: The pattern to format the date with
function nukeFormatDate(date, format) {
    var dat = date;
    if (!(date instanceof Date)) {
        // parse
        dat = new Date(date);
    }

    return dat.format(format);
}

// Parses a date with brazilian format (dd/MM/YYYY)
// date: The date to format
function nukeParseDate(date) {
    var split = date.split('/');

    var day = split[0];
    var month = split[1];
    var year = split[2];

    return new Date(year, month, day);
}
// Removes all repeated characters on a string
// str: The string to check for repeated characters
function nukeStringRemoveRepeatedChars(str) {
    var toRet = '';
    for (var i = 0; i < str.length; i++) {
        var ch = str[i];
        if (toRet.indexOf(ch) == -1) {
            toRet += ch;
        }
    }
    return toRet;
}
// Removes all instances of characters on the designated pattern.
// Though the pattern is supposed to be a string, the checking is made on specific characters
// str: The string to modify
// pattern: The pattern to remove characters from the str
function nukeStringRemoveAllInstancesOff(str, pattern) {
    var toRet = '';
    for (var i = 0; i < str.length; i++) {
        var ch = str[i];
        if (pattern.indexOf(ch) == -1) {
            toRet += ch;
        }
    }
    return toRet;
}
// Removes a mask from the masked string
// str: The string to remove the mask from
// mask: The mask to remove from the string
//
// Trivia: Doesn't work with characters for now
function nukeRemoveMask(str, mask) {
    var digits = mask.replace(/\d+/g, '')
    var single = nukeStringRemoveRepeatedChars(digits);
    return nukeStringRemoveAllInstancesOff(str, single);
}
// Always returns a jQuery object
// id: The id/object to return as jquery
function nukeGetCleanJQuery(id) {
    if (typeof id === 'string') {
        if (id.indexOf('#') != 0) {
            id = '#' + id;
        }
        var ret = $(id);
        if (ret.length == undefined || ret.length == 0) {
            return ret;
        }
        else {
            return ret[0];
        }
    }
    if (id instanceof jQuery) {
        return id;
    }

    return $(id);
}
// Gets the text from a component, cleaned of it's mask (if it exists)
// id: The id to get the text from
function nukeGetCleanTextValue(id) {
    var obj = nukeGetCleanJQuery(id);
    var value = obj.value;
    var maskData = $(obj).data('mask');
    if (maskData != null) {
        var mask = maskData.mask;
        value = nukeRemoveMask(value, mask);
    }
    return value;
}

var __nukeRanOnce;
var __nukeDict = [];
var __nukeOptions = {};
__nukeOptions.clickSetRadio = true;

// Initializes the Nucleus environment, setting up variables that may
// be needed
function nukeSetUp() {
    if (__nukeOptions.clickSetRadio) {
        $(document).on('click', '.nukeClickInput', function () {
            var parent = $(this).parent();
            var radio = parent.find('input');
            radio.prop('checked', true);
        });
    }
}


// Changes the state of form components to hide
// every component that shouldn't be shown if the form is readonly or not
// * How it works *
// You make just 1 screen for editting/just visualizing an object, but make both fields for editting and viewing.
// Every label that just shows data you add the class nukeView
// Every textBox/input/etc you add the class nukeEdit
// If you want to disable/readonly components, use class nukeRead
// If you want to reverse disable/readonly components, use class nukeReadR
// Call this method to updated everything depending on the state needed for the form.
function nukeChangeState(readOnly) {
    readOnly = nukeStringToBoolean(readOnly); // be sure it's a boolean
    __nukeFormState = readOnly;

    if (readOnly) {
        $('.nukeView').each(function (i) {
            $(this).show();
        });
        $('.nukeEdit').each(function (i) {
            $(this).hide();
        });
    }
    else {
        $('.nukeView').each(function (i) {
            $(this).hide();
        });
        $('.nukeEdit').each(function (i) {
            $(this).show();
        });
    }

    $('.nukeRead').each(function (i) {
        $(this).attr('readonly', readOnly);
        $(this).attr('disabled', readOnly);
    });
    $('.nukeReadR').each(function (i) {
        $(this).attr('readonly', !readOnly);
        $(this).attr('disabled', !readOnly);
    });
}


// Update every component with the nuke property
// parentId: The parent id to limit search for. Will be the whole document if ommited/null
// * How it works *
// Declare the nuke property on every component you want to run code
// Commands:
// - foreach [array]
//      The foreach command will loop the array provided, and repeat the
//      components inner html for each object in the array. 
//      On the HTML inside the foreach parent, you can use:
//      - $varName$ to access variables of the current object on the loop
//      - $__index$ to get the index on the loop
//      You can execute code inside the $$ brackets, but you will always have to start with the varName.
//      For example, this is doable:  $isBlocked ? 'Blocked' : 'Not Blocked'$
//      
// - exists [boolean]
//      The exists command will evaluate your boolean parameter, and delete
//      the component if it shouldn't exist
//
function nukeRefresh(parentId) {
    parentId = typeof parentId !== 'undefined' ? parentId : document;
    var parent = nukeGetCleanJQuery(parentId);

    var divs = $(parent).find("[nuke]");
    divs.each(function (i) {
        var meself = $(this);

        var att = meself.attr('nuke');
        var spllited = att.split(' ');

        // foreach test
        if (att.indexOf('foreach') == 0) {
            var arrayName = spllited[1];
            var myId = meself.attr('id');
            if (isnull(myId)) {
                myId = makeRandomString(10);
                meself.attr('id', myId);
            }

            var html;
            if (__nukeRanOnce) {
                html = __nukeDict[myId];
                if (isnull(html)) {
                    // get inner html maybe?
                    html = this.innerHTML;
                    __nukeDict[myId] = html;
                }
            } else {
                html = this.innerHTML;
                __nukeDict[myId] = html;
            }
            this.innerHTML = '';

            var array;
            try {
                array = eval(arrayName);
            }
            catch (ex) {
                return; // object doesnt exist (yet?)
            }

            for (i = 0; i < array.length; i++) {
                var element = array[i];
                var thtml = html;

                var start = 0;
                var index = 0;
                for (; ;) {
                    index = thtml.indexOf('$', start);
                    if (index == -1) {
                        break;
                    }
                    var endIndex = thtml.indexOf('$', index + 1);
                    var word = thtml.substring(index + 1, endIndex);

                    var value = word;
                    if (word.indexOf('__index') != -1) {
                        value = value.replace('__index', i);
                    }
                    if (value.indexOf('@') != -1) {
                        value = value.replace('@', 'element.');
                        value = eval(value);
                    } else {
                        value = eval('element.' + value);
                    }

                    thtml = thtml.replace('$' + word + '$', value);
                }

                meself.append(thtml);
            }

            nukeRefresh(meself);
        }
        else if (att.indexOf('exists') == 0) {
            var js = spllited[1];

            if (js.indexOf('isReadOnly') != -1) {
                js = js.replace('isReadOnly', __nukeFormState);
            }

            var doExist = eval(js);
            if (!doExist) {
                // delete
                meself.remove();
            }
        }
    });
    __nukeRanOnce = true;

    nukeChangeState(__nukeFormState);
}

// Populates every input/div component with the name property equals to the variable name on the data, 
// based on the data provided
//  data: Data to populate form with
//  formId: An specific component to limit search to. If null/ommited will search through all $(document)
function nukePopulateForm(data, formId) {
    var jform = $(formId);
    for (var name in data) {
        var inputs = jform.find('[name="' + name + '"]');
        if (inputs.length > 0) {
            var value = eval('data.' + name);
            if (value instanceof Date) {
                value = value.format(dateMask);
            }

            for (var i = 0; i < inputs.length; i++) {
                var inp = inputs[i];

                if (inp.localName == 'div') {
                    inp.innerHTML = value;
                }
                else {
                    if (inp.type == 'checkbox') {
                        $(inp).attr('checked', inp);
                    }
                    else {
                        inp.value = value;
                    }
                }
            }
        }
    }
}


// Extracts information from input components
// formId: An specific component to limit search to. If null/ommited will search through all $(document)
function nukeGetFormData(formId) {
    formId = typeof formId !== 'undefined' ? formId : 'document';

    var data = {};
    var jform = $(formId);
    var inputs = jform.find('input');

    for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i];

        if (input.id in nukeErrors) {
            return false;
        }

        // check for mask
        if (input.type == 'checkbox') {
            eval('data.' + input.id + ' = \'' + $(input).prop('checked') + '\'');
        }
        else {
            var value = nukeGetCleanTextValue(input);
            eval('data.' + input.id + ' = \'' + value + '\'');
        }
    }

    return data;
}

// A collection of every component that has an error
var nukeErrors = [];
var __nukeFormState = false;

// Validation functions for input
// ----- ### -------
// Validates a Numeric input
// id: The id of the numeric input
// minSize: The minimum length the numeric input should have to validate
// maxSize: The maximum length the numeric input should have to validate
function nukeRegErrorCheck_Numeric(id, minSize, maxSize) {
    validateInput(id, minSize, maxSize,
        function (value, parent, min, max) {
            var errors = [];
            if (!val.match(/^\d+$/)) {
                errors.push('numeric');
            }
            if (value.length >= min) {
                errors.push('small');
            }
            if (value.length < max) {
                errors.push('big');
            }
            return errors;
        });
}

// Validates a text input
// id: The id of the text input
// minSize: The minimum length the text input should have to validate
// maxSize: The maximum length the text input should have to validate
function nukeRegErrorCheck_Text(id, minSize, maxSize) {
    validateInput(id, minSize, maxSize,
        function (value, parent, min, max) {
            var errors = [];
            if (value.length >= min) {
                errors.push('small');
            }
            if (value.length < max) {
                errors.push('big');
            }
            return errors;
        });
}

// Validates an email text input
// id: The id of the text input
// minSize: The minimum length the text input should have to validate
// maxSize: The maximum length the text input should have to validate
function nukeRegErrorCheck_Email(id, minSize, maxSize) {
    validateInput(id, minSize, maxSize,
        function (value, parent, min, max) {
            var errors = [];
            if (!nukeValidateEmail(value)) {
                errors.push('email');
            }
            if (value.length >= min) {
                errors.push('small');
            }
            if (value.length < max) {
                errors.push('big');
            }
            return errors;
        });
}

// Generic validation function, use it to implement other validations 
// (see nukeRegErrorCheck_Text for example)
function validateInput(id, minSize, maxSize, evalFunc) {
    minSize = typeof minSize !== 'undefined' ? minSize : 0;
    maxSize = typeof minSize !== 'undefined' ? maxSize : 99999;

    $(document).on('input', id, function () {
        var value = nukeGetCleanTextValue(id);
        var parent = $(id).parent();

        var errorId = id + '_erro';
        var errorLabel = $(errorId)[0];

        var errors = evalFunc(value, parent, minSize, maxSize);

        if (errors.length == 0) {
            if (errorLabel != null) {
                errorLabel.html('');
            }
            parent.removeClass('has-error');
            delete nukeErrors[id];
        } else {
            if (errorLabel != null) {
                errorLabel.innerHTML = getErrorMsg(errors);
            }

            parent.addClass('has-error');
            nukeErrors.push(id);
        }
    });
}

// Returns an error message based on an array of messages
function getErrorMsg(errors) {
    var error = '';

    if (errors.contains('email')) {
        error += ",Texto digitado n�o � um email";
    }
    if (errors.contains('numeric')) {
        error += ",Letras n�o s�o permitidas";
    }
    if (errors.contains('small')) {
        error += ",Texto digitado � pequeno demais";
    }
    if (errors.contains('big')) {
        error += ",Texto digitado � muito grande";
    }

    if (error.indexOf(',') == 0) {
        error = error.substring(1);
    }
    var last = error.lastIndexOf(',');
    if (last != 0) {
        error.replaceAt(last, ' e');
    }

    return error;
}

// Library for Date formatting
// Date Format library
/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */
var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d: d,
                dd: pad(d),
                ddd: dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m: m + 1,
                mm: pad(m + 1),
                mmm: dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy: String(y).slice(2),
                yyyy: y,
                h: H % 12 || 12,
                hh: pad(H % 12 || 12),
                H: H,
                HH: pad(H),
                M: M,
                MM: pad(M),
                s: s,
                ss: pad(s),
                l: pad(L, 3),
                L: pad(L > 99 ? Math.round(L / 10) : L),
                t: H < 12 ? "a" : "p",
                tt: H < 12 ? "am" : "pm",
                T: H < 12 ? "A" : "P",
                TT: H < 12 ? "AM" : "PM",
                Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default": "ddd mmm dd yyyy HH:MM:ss",
    shortDate: "m/d/yy",
    mediumDate: "mmm d, yyyy",
    longDate: "mmmm d, yyyy",
    fullDate: "dddd, mmmm d, yyyy",
    shortTime: "h:MM TT",
    mediumTime: "h:MM:ss TT",
    longTime: "h:MM:ss TT Z",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};