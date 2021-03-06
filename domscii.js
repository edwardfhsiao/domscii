(function (root, factory) {
  var NAME = 'domscii';
  if (typeof define === 'function' && define.amd) {
    define(['html2canvas'], function (html2canvas) {
      return (root[NAME] = factory(html2canvas));
    });
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('html2canvas'));
  } else {
    root[NAME] = factory(root.html2canvas);
  }
}(this, function (html2canvas) {
  domscii.DEFAULTS = {
    template: '<span style="color:${color}">${char}</span>',
    //template: '${char}',
    chars: '@#$=*!;:~-,.', // can be array of strings
    newline: '\n',
    scaleX: 7.875,
    scaleY: 15,
    html2canvas: {}
  };
  function domscii (opts) {
    if (opts instanceof Node) opts = {el: opts};
    opts.html2canvas = extend(domscii.DEFAULTS.html2canvas, opts.html2canvas);
    opts = extend(domscii.DEFAULTS, opts);

    var factor = (opts.chars.length-1)/255;

    return html2canvas(opts.el, opts.html2canvas).then(function (canvas) {
      var data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      var _slice = [].slice.bind(data);

      var lines = [];
      for (var y = 0; y < canvas.height; y += opts.scaleY) {
        var line = '';
        for (var x = 0; x < canvas.width; x += opts.scaleX) {
          var i = Math.floor(y*canvas.width + x)*4;
          var rgba = _slice(i, i+4);
          var char = opts.chars[Math.round(factor*rms(rgba.slice(0, 3)))];
          line += opts.template
            .replace('${char}', char)
            .replace('${color}', 'rgba('+rgba.join(',')+')');
        }
        lines.push(line);
      }
      return lines.join(opts.newline);
    });
  }

  function rms (vector) {
    return Math.sqrt(vector.reduce(function (total, val) {
      return total + (val*val);
    }, 0) / vector.length);
  }

  function extend (obj, props) {
    obj = Object.create(obj);
    for (var prop in props) {
      if (props.hasOwnProperty(prop)) {
        obj[prop] = props[prop];
      }
    }
    return obj;
  }

  return domscii;
}));
