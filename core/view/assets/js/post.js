/* global CodeMirror, $ */

var editor = CodeMirror.fromTextArea($('#editor')[0], {
    mode: null,
    indentUnit: 4,
    lineWrapping: true,
});