/**
 * Ganji UI Library基础模块.
 * 使用全局变量GJ作为命名空间，用以包装最基础的应用.
 * @module ganji
 * @file js/util/ganji/ganji.js
 * @author lwg_8088@yahoo.com.cn
 * @version 2010-01-05
 */

var GJ = window.GJ || {},
    __GJ_CONFIG__ = window.__GJ_CONFIG__ || {};


(function (){
    var win = window, doc = win.document;
    if (win.__GJ_LOADED__){
        return;
    }
    win.__GJ_LOADED__ = true;

    /**
     * 配置变量.
     * 包括：
     * <ul>
     *     <li><strong>debug</strong> &nbsp; &nbsp; 是否调试。如果为true将使用未压缩、未合并的文件。</li>
     *     <li><strong>rootDir</strong> &nbsp; &nbsp; 根目录。当debug为true时是'src/'，否则为'public/'</li>
     *     <li><strong>addVersion</strong> &nbsp; &nbsp; 是否添加版本号。</li>
     *     <li><strong>useCombine</strong> &nbsp; &nbsp; 是否使用合并文件。</li>
     *     <li><strong>cookieDomain</strong> &nbsp; &nbsp; 保存cookie时的域，默认为'ganji.com'。</li>
     *     <li><strong>iframeProxyUrl</strong> &nbsp; &nbsp; 使用跨域iframe时的代理文件，默认为'/iframeproxy.html'。该文件要放在父窗口同域的根目录下。</li>
     *     <li><strong>defaultServer</strong> &nbsp; &nbsp; 静态文件服务默认域名。默认值'sat.ganji.com'</li>
     *     <li><strong>servers</strong> &nbsp; &nbsp; 静态文件服务其他域名。</li>
     *     <li><strong>fileVersions</strong> &nbsp; &nbsp; 文件版本号信息。</li>
     *     <li><strong>fileCombines</strong> &nbsp; &nbsp; 合并文件对应信息。</li>
     *     <li><strong>fileCodes</strong> &nbsp; &nbsp; 文件或文件组代号。</li>
     *
     * </ul>
     * @property GJ.config
     * @static
     * @type object
     */
    GJ.config = {
        debug : false,
        rootDir : '', //debug == true ? 'src/' : 'public/'
        addVersion : false,
        useCombine : false, //debug为true时只能是false
        iframeProxyUrl : '/iframeproxy.html',  //跨域iframe调用时的代理文件，必须放在当前域下
        servers : ["sta.ganjistatic1.com"],
        fileVersions : {},
        fileCombines : {},
        fileCodes    : {
            autocomplete   : 'js/util/autocomplete/autocomplete.js',
            jquery         : "js/util/jquery/jquery-1.7.2.js",
            jquery_ui       : "js/util/jquery/jquery.ui.js",
            util           : "js/util/ganji/util.cmb.js",
            json           : "js/util/json/json.js",
            log_tracker    : "js/util/log_tracker/log_tracker_simple.js",
            iframe         : ["jquery", "js/util/iframe/iframe.js"],
            panel          : ["js/util/panel/panel.css", "iframe", "js/util/dragdrop/dragdrop.js", "js/util/panel/panel.js"],
            flash          : ["jquery", "js/util/swfobject/swfobject-2.2.js", "js/util/swfobject/swfloader.js"],
            talk_to_parent : ["jquery", "js/util/window_name/window_name.js", "js/util/iframe/talk_to_parent.js"]
        },
        cdnFiles : {
            'tool/webim/js/webim.cmb.js': 1,
            'tool/webim_v2/js/webim.cmb.js': 1,
            'tool/webim_v3/js/webim.cmb.js': 1
        }
    };

    /**
     * 已经载入或正在载入的js与css文件集
     * 下标为url，值为1表示正在载入，为2表示载入完毕
     * @property GJ.loadedFiles
     * @static
     * @type object
     */
    GJ.loadedFiles = {};

    /**
     * 发送日志给日志服务器
     *
     * @params <type> {string} type 值(有索引)
     * @params <message> {string} 描述(无索引)
     */
    GJ.tralog = function (type, message) {
        var img = new Image();
        if (GJ.config.debug) {
            return;
        }

        img.src = 'http://tralog.ganji.com/sta/log.gif?' +
            [
                't=' + type,
                'm=' + message
            ].join('&');
    };

    //数据类型判断
    (function(){
        var TYPES = {
            'undefined'         : 'undefined',
            'number'            : 'number',
            'boolean'           : 'boolean',
            'string'            : 'string',
            '[object Function]' : 'function',
            '[object RegExp]'   : 'regexp',
            '[object Array]'    : 'array',
            '[object Date]'     : 'date',
            '[object Error]'    : 'error'
        },
        L = {
            /**
             * 判断一个变量是不是数组.
             * @method GJ.isArray
             * @static
             * @param o 用来测试的变量
             * @return {boolean} 如果是数组返回true
             */
            isArray : function(o){
                return L.typeOf(o) === 'array';
            },

            /**
             * 判断一个变量是不是布尔值.
             * @method GJ.isBoolean
             * @static
             * @param o 用来测试的变量
             * @return {boolean} 如果是布尔值返回true
             */
            isBoolean : function(o){
                return typeof o === 'boolean';
            },

            /**
             * 判断一个变量是不是函数.
             * @method GJ.isFunction
             * @static
             * @param o 用来测试的变量
             * @return {boolean} 如果是函数返回true
             */
            isFunction : function(o){
                return L.typeOf(o) === 'function';
            },

            /**
             * 判断一个变量是不是日期.
             * @method GJ.isDate
             * @static
             * @param o 用来测试的变量
             * @return {boolean} 如果是日期返回true
             */
            isDate : function(o){
                return L.typeOf(o) === 'date';
            },

            /**
             * 判断一个变量是不是null.
             * @method GJ.isNull
             * @static
             * @param o 用来测试的变量
             * @return {boolean} 如果是null返回true
             */
            isNull : function(o){
                return o === null;
            },

            /**
             * 判断一个变量是不是数字.
             * @method GJ.isNumber
             * @static
             * @param o 用来测试的变量
             * @return {boolean} 如果是数字返回true
             */
            isNumber : function(o){
                return typeof o === 'number' && isFinite(o);
            },

            /**
             * 判断一个变量是不是对象.
             * @method GJ.isObject
             * @static
             * @param o 用来测试的变量
             * @param failfn {boolean} 如果设为true，则函数不算作对象。默认值：false
             * @return {boolean} 如果是对象返回true
             */
            isObject : function(o, failfn){
                return (o && (typeof o === 'object' || (!failfn && L.isFunction(o)))) || false;
            },

            /**
             * 判断一个变量是不是字符串.
             * @method GJ.isString
             * @static
             * @param o 用来测试的变量
             * @return {boolean} 如果是字符串返回true
             */
            isString : function(o){
                return typeof o === 'string';
            },

            /**
             * 判断一个变量是不是未定义。
             * 只能判断一个对象的元素，不能是单独的变量，如:
             * if (GJ.isUndefined(window.name)){
             *     ...
             * }
             * @method GJ.isUndefined
             * @static
             * @param o 用来测试的变量
             * @return {boolean} 如果是未定义返回true
             */
            isUndefined : function(o){
                return typeof o === 'undefined';
            },

            /**
             * 判断一个变量是否不是null/undefined/NaN.
             * @method GJ.isValue
             * @static
             * @param o 用来测试的变量
             * @return {boolean} 如果不是null/undefined/NaN返回true
             */
            isValue : function(o){
                var t = L.typeOf(o);
                switch (t){
                    case 'number':
                        return isFinite(o);
                    case 'null':
                    case 'undefined':
                        return false;
                    default:
                        return !!(t);
                }
            },

            /**
             * 检测一个变量的类型.
             * @method GJ.typeOf
             * @static
             * @param o 用来检测的变量
             * @return {string} 返回变量的类型
             */
            typeOf : function (o){
                return  TYPES[typeof o] || TYPES[Object.prototype.toString.call(o)] || (o ? 'object' : 'null');
            }
        };

        /**
         * 合并两个对象。
         * 将参数supplies对象的元素合并到参数receive对象中
         * @method GJ.mix
         * @static
         * @param {object} receive 源对象
         * @param {object} supplies 用来合并到receive中的对象
         * @param {boolean} overwritten 如果设为true，supplies中的元素将替换receive中的同名元素，默认值为false
         * @param {boolean} recursion 是否递归，默认值为false
         * @return {object} 返回receive对象的引用
         */
        GJ.mix = function (r, s, ov, rec)
        {
            if (L.isObject(r) && L.isObject(s)){
                for (var i in s){
                    if (s.hasOwnProperty(i)) {
                        if (!(i in r)) {
                            r[i] = s[i];
                        } else if (ov) {
                            if (rec && L.isObject(r[i], true) && L.isObject(s[i], true)) {
                                GJ.mix(r[i], s[i], ov, rec);
                            } else {
                                r[i] = s[i];
                            }
                        }
                    }
                }
            }
            return r;
        };

        GJ.mix(GJ, L, true);
    })();

    /**
     * 遍历对象或数组，对每个元素应用回调函数。
     * @method GJ.each
     * @static
     * @param {object|array} o 要遍历的对象或数组
     * @param {Function} callback 回调函数。将为此函数设置两个参数：val元素值，key元素下标。
     * 在函数内部使用return false可以终止遁环
     */
    GJ.each = function(o, cb){
        if (GJ.isFunction(cb)){
            var i, n, r;
            if (GJ.isArray(o)){
                for (i=0, n=o.length; i<n; i++){
                    r = cb(o[i], i);
                    if (r === false) break;
                }
            }
            else if (GJ.isObject(o)){
                for (i in o){
                    if (o.hasOwnProperty(i)){
                        r = cb(o[i], i);
                        if (r === false) break;
                    }
                }
            }
        }
    };
    GJ.map = function (arr, cb) {
        var ret = [];
        GJ.each(arr, function (v, i) {
            ret.push(cb(v, i));
        });
        return ret;
    }
    GJ.inArray = function (v, arr) {
        var index = -1;
        GJ.each(arr, function (a, i) {
            if (a === v) {
                index = i;
                return false;
            }
        });
        return index;
    }

    /**
     * 设置配置变量。
     * 有两种使用方法：GJ.setConfig(config)和GJ.setConfig(key, val)
     * @method GJ.setConfig
     * @static
     * @param {object} config 配置数据对象
     */
    GJ.setConfig = function(config)
    {
        var a=arguments, cfg=GJ.config;
        if (a.length == 2){
            var o = {};
            o[a[0]] = a[1];
            GJ.setConfig(o);
        }
        else {
            GJ.each(config, function(v, k){
                if (GJ.isObject(cfg[k])){
                    GJ.mix(cfg[k], v, true);
                }
                else cfg[k] = v;
            });
        }

        cfg.rootDir = cfg.debug ? 'src/' : 'public/';
        if (cfg.debug) cfg.useCombine = false;
    };

    (function (){
        if (!window.__GJ_PACK_CONFIG__) return ;

        var ret = [], o = window.__GJ_PACK_CONFIG__,
            getVal = function (val){
                if (GJ.isNumber(val)) {
                    return ret[val];
                } else {
                    var r = [];
                    GJ.each(val, function (v, k){
                        r.push(ret[val[k]]);
                    });
                    return r;
                }
            },
            parseIt = function (val, type){
                var r = {};
                GJ.each(val, function (v, k){
                    if (type == 1) {
                        r[ret[k]] = v;
                    } else if (type == 2) {
                        r[ret[k]] = getVal(v);
                    } else if (type == 3) {
                        r[k] = getVal(v);
                    }
                });
                return r;
            };

        GJ.each(o.words, function (v, k){
            var s = v.split('|');
            ret[k] = s[1] ? ret[s[0]] + s[1] : s[0];
        });
        o.fileVersions = parseIt(o.fileVersions, 1);
        o.fileCombines = parseIt(o.fileCombines, 2);
        o.fileCodes    = parseIt(o.fileCodes, 3);
        delete o.words;

        GJ.setConfig(o);
    })();

    GJ.setConfig(__GJ_CONFIG__);

    /**
     * 取得从from(含from)到to(含to)的整数随机数。
     * @method GJ.rand
     * @static
     * @param {int} from 起始数字
     * @param {int} to 结束数字
     * @return {int} 返回生成的随机数
     */
    GJ.rand = function (from, to)
    {
        return parseInt(Math.random() * (to - from + 1) + from);
    };

    (function(){
        var count = 0;
        /**
         * 取得一个随机的sta*.ganji.com。
         * @method GJ.getRandServer
         * @static
         * @return {string} 返回ganji_sta的域名
         */
        GJ.getRandServer = function()
        {
            var servers = GJ.config.servers;
            return servers[count++ % servers.length];
        };
    })();

    /**
     * 设置命名空间。
     * 可以同时设置多个命名空间，每个命名空间可以是多级。
     * @method GJ.namespace
     * @static
     * @param {string} o* 一个或多个参数
     * @example GJ.namespace('util', 'widget.image');
     */
    GJ.namespace = function(){
        var a=arguments, o=null, i, n, j, k, d;
        for (i=0, n=a.length; i<n; i++){
            d=a[i].split("."); o=GJ;

            for (j=(d[0] == "GJ") ? 1 : 0, k=d.length; j<k; j++){
                o[d[j]]=o[d[j]] || {};
                o=o[d[j]];
            }
        }
        return o;
    };
    GJ.namespace('util', 'apps', 'widget', 'common');

    (function(){
        var _copyFunctions = function(ret, o){
                GJ.each(o, function(v, k){
                    if (GJ.isFunction(v)) {
                        ret[k] = function(_v){
                            return function(){
                                return _v.apply(o, arguments);
                            }
                        }(v);
                    }
                });
            }
            ,_fromObj = {'**SYS_FROM_INSIDE**' : true};

        GJ.f = function(params, cb){
            if (arguments.length === 1) {
                cb = params;
                params = {};
            }

            var __const     = params.__const   || {}
                ,__extends  = params.__extends || null;

            function func(_ret, _protected, _from) {
                var isEntry  = !_from || !_from['**SYS_FROM_INSIDE**']
                    ,ret     = isEntry ? {} : _ret
                    ,_protec = isEntry ? {} : _protected
                    ,parent  = null;

                if (__extends) {
                    if (GJ.isArray(__extends)) {
                        for (var i=0, n=__extends.length; i<n; i++) {
                            if (GJ.isFunction(__extends[i])) {
                                __extends[i](ret, _protec, _fromObj);
                            }
                        }
                    } else if (GJ.isFunction(__extends)) {
                        __extends(ret, _protec, _fromObj);
                    }

                    parent = {};
                    _copyFunctions(parent, ret);
                }

                if (GJ.isFunction(cb)) {
                    var conf = cb.apply(ret, [_protec, parent]);
                    if (GJ.isObject(conf)) {
                        GJ.mix(ret, conf, true);
                    }
                }

                if (isEntry) {
                    if (ret.__construct) {
                        ret.__construct.apply(ret, arguments);
                        delete ret.__construct;
                    }
                }

                return ret;
            }

            if (params.__static) {
                GJ.mix(func, params.__static, true);
            }

            func.getConst = function(k) {
                return __const[k] || null;
            }

            return func;
        };
    })();

    /**
     * 实现类的继承。
     * @method GJ.extend
     * @static
     * @param {class} r 当前类
     * @param {class} s 父类
     * @param {class} px 要添加的成员变量
     * @param {class} sx 要添加的静态变量
     */
    GJ.extend = function(r, s, px, sx)
    {
        if (!s||!r){
            alert("extend failed, verify dependencies");
        }

        var sp=s.prototype, F=function(){};
        F.prototype = sp;
        var rp = new F();

        r.prototype    = rp;
        rp.constructor = r;
        r.superclass   = sp;

        if (s != Object && sp.constructor == Object.prototype.constructor){
            sp.constructor = s;
        }

        if (px){
            GJ.mix(rp, px, true);
        }

        if (sx){
            GJ.mix(r, sx, true);
        }
    };

    /**
     * 创建一个类。
     * 有三种用法：<br />
     * 1、GJ.createClass(parentClass, prototypeObject, staticObject);<br />
     * 2、GJ.createClass(prototypeObject, staticObject);<br />
     * 3、GJ.createClass(prototypeObject);<br />
     * 参数parentClass表示父类，prototypeObject是成员变量，staticObject是静态变量<br />
     * 参数prototypeObject中应有下标为init的函数作为构造函数
     *
     * @method GJ.createClass
     * @static
     * @param {object} args* 父类、成员变量、静态变量
     * @return {class} 返回创建的类
     * @example
     * <script type="text/javascript">
     * GJ.createClass({
     *     init : function(){},
     *     ...
     * });
     * </script>
     */
    GJ.createClass = function(){
        var a = arguments, l = a.length;

        function F(){
            this.__inited__ = false;

            if (F.superclass){
                F.superclass.constructor.apply(this, arguments);
            }

            if (!this.__inited__ && this.init && GJ.isFunction(this.init)){
                var ret = this.init.apply(this, arguments);
                this.__inited__ = true;
                if (GJ.isObject(ret)) return ret;
            }
        }

        if (GJ.isFunction(a[0])){
            GJ.extend(F, a[0], a[1] || null, a[2] || null);
        }
        else {
            if (a[0]){
                F.prototype = a[0];
            }
            if (a[1]){
                GJ.mix(F, a[1], true);
            }
        }

        return F;
    };

    (function(){
        var guid_counter = 0;
        /**
         * 取得一个不重复的随机字符串
         * @method GJ.guid
         * @static
         * @param {string} pre 前缀 默认为"guid_"
         * @return {string}
         */
        GJ.guid = function(pre)
        {
            var r = new Date().getTime() + '' + Math.random();
            return (pre ? pre : 'guid_') + guid_counter++ + '_' + r.replace(/\./g, '_');
        }

        var cacheData = {};
        /**
         * 根据id号取得缓存对象
         * @method GJ.getCache
         * @static
         * @param {string} id 关联缓存对象的id号
         * @return {object}
         */
        GJ.getCache = function (id)
        {
            return !GJ.isUndefined(cacheData[id]) ? cacheData[id] : null;
        };
        /**
         * 将一个局部变量存入缓存，以便通过GJ.getCache(id)获取
         * 有两种用法：<br />
         * 1、直接将变量存入缓存，并返回id号。如：var id = GJ.setCache(val);<br />
         * 2、将变量存入缓存的同时，指定id号。如：GJ.setCache(id, val);
         * @method GJ.setCache
         * @static
         * @param {string} id 关联缓存对象的id号
         * @param {object} data 要存储的变量
         * @return {string} 返回关联缓存对象的id号
         */
        GJ.setCache = function (id, data)
        {
            if (arguments.length == 1){
                data = id;
                id = GJ.guid();
            }
            cacheData[id] = data;
            return id;
        };
        /**
         * 根据id号移除缓存对象
         * @method GJ.removeCache
         * @static
         * @param {string} id 关联缓存对象的id号
         * @return {void}
         */
        GJ.removeCache = function (id)
        {
            if (!GJ.isUndefined(cacheData[id])){
                delete cacheData[id];
            }
        };
        /**
         * 清空缓存数据
         * @method GJ.clearCache
         * @static
         * @return {void}
         */
        GJ.clearCache = function ()
        {
            cacheData = {};
        };
    })();

    /**
     * 根据cookie名称取得cookie值
     * @method GJ.getCookie
     * @static
     * @param {string} name cookie名称
     * @return {string}
     */
    GJ.getCookie = function(name)
    {
        var doc=document, val = null, regVal;

        if (doc.cookie){
            regVal = doc.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
            if(regVal != null){
                val = decodeURIComponent(regVal[2]);
            }
        }

        return val;
    };

    /**
     * 设置cookie
     * @method GJ.setCookie
     * @static
     * @param {string} name cookie名称
     * @param {string} value cookie值
     * @param {int} expire 过期时间(秒)，默认为零
     * @param {string} path 路径，默认为空
     * @param {string} domain 域
     * @return {boolean} 设置成功返回true
     */
    GJ.setCookie = function(name, value, expire, path, domain, s)
    {
        if (GJ.isUndefined(document.cookie)){
            return false;
        }

        expire = !GJ.isNumber(expire) ? 0 : parseInt(expire);
        if (expire < 0){
            value = '';
        }

        var dt = new Date();
        dt.setTime(dt.getTime() + 1000 * expire);

        document.cookie = name + "=" + encodeURIComponent(value) +
            ((expire) ? "; expires=" + dt.toGMTString() : "") +
            "; path=" + (path || '/') +
            "; domain=" + (domain || GJ.config.cookieDomain) +
            ((s) ? "; secure" : "");

        return true;
    };

    /**
     * 移除cookie
     * @method GJ.removeCookie
     * @static
     * @param {string} name cookie名称
     * @param {string} path 路径，默认为空
     * @param {string} domain 域
     * @return {boolean} 移除成功返回true
     */
    GJ.removeCookie = function(name, path, domain)
    {
        return GJ.setCookie(name, '', -1, path, domain);
    };

    /**
     * 抛出错误提示
     * @method GJ.error
     * @static
     * @param {string} msg 提示信息
     * @return {void}
     */
    GJ.error = function(msg)
    {
        throw new Error(msg);
    };

    /**
     * 通过firebug显示调试信息
     * @method GJ.log
     * @static
     * @param {object} data 要调试的数据
     * @return {void}
     */
    GJ.log = function(data)
    {
        //if (GJ.isFunction(GJ.jsonEncode)){
        //    data = GJ.jsonEncode(data, '    ');
        //}

        if (typeof console != 'undefined' && console.log){
            console.log(data);
        }
        else if (typeof opera != 'undefined'){
            opera.postError(data);
        }
    };

    /**
     * 延迟定时执行回调函数
     * 是对setTimeout()和setInterval()的包装
     * @method GJ.later
     * @static
     * @param {Function} fn 回调函数
     * @param {int} when 延迟毫秒数
     * @param {boolean} loop 是否循环。默认为false
     * @return {object} 返回一个对象，通过此对象的cancel()方法，可以取消定时器
     * @example
     * <script type="text/javascript">
     * var i = 0, timer;
     * timer = GJ.later(function(){
     *     alert(i);
     *     i++;
     *     if (i == 10) timer.cancel();
     * }, 2000, true);
     * </script>
     */
    GJ.later = function(fn, when, loop)
    {
        when = when || 0;
        var r = null,
            run = function(){
                r = r || (loop) ? setInterval(fn, when) : setTimeout(fn, when);
            };
        run();

        return {
            run : run,
            cancel: function(){
                if (r){
                    if (loop){
                        clearInterval(r);
                    } else {
                        clearTimeout(r);
                    }
                    r = null;
                }
            }
        };
    };

    /**
     * 等候条件为真是执行回调函数
     * @method GJ.waiter
     * @static
     * @param {Function} check 用来检测是否为真的函数或是否可用的变量
     * @param {Function} callback 回调函数
     * @param {int} speed 间隔毫秒数。默认为100。每间隔speed毫秒检查一次
     * @param {int} expire 过期时间(秒)。默认为10秒
     * @return {void}
     * @example
     * <script type="text/javascript">
     * GJ.waiter(function(){
     *     return !!window.jQuery;
     * }, function(){
     *     $('#id').html('Hello World!');
     * });
     *
     * var check = function(){
     *     return !GJ.isUndefined(window.jQuery);
     * };
     * GJ.waiter(check, function(){
     *     $('#id').html('Hello World!');
     * });
     * </script>
     */
    GJ.waiter = function(check, callback, speed, expire)
    {
        if (!GJ.isFunction(check) || !GJ.isFunction(callback)){
            return ;
        }

        var _speed = speed || 100, _time = 0, expire = (expire || 10)*1000,
            _run = function(ck, cb){
                if (ck()){
                    cb();
                    return ;
                }
                _time += _speed;
                if (!expire || _time < expire){
                    GJ.later(function(){
                        _run(ck, cb);
                    }, _speed);
                }
            };

        _run(check, callback);
    };

    /**
     * 为元素绑定事件
     * @event GJ.addEvent
     * @static
     * @param {object} el 要绑定事件的网页元素
     * @param {string} type 事件类型名称，如click
     * @param {Function} func 要绑定的事件函数
     * @return {void}
     */
    GJ.addEvent = function(el, type, fn){
        if (el.addEventListener){
            el.addEventListener(type, fn, false);
        }
        else if (el.attachEvent){
            el.attachEvent("on" + type, fn);
        }
    };

    /**
     * 为元素移除事件绑定
     * @event GJ.removeEvent
     * @static
     * @param {object} el 要移除事件绑定的网页元素
     * @param {string} type 事件类型名称，如click
     * @param {Function} func 要移除的事件函数
     * @return {void}
     */
    GJ.removeEvent = function(el, type, fn){
        if (el.removeEventListener){
            el.removeEventListener(type, fn, false);
        }
        else if (el.detachEvent){
            el.detachEvent("on" + type, fn);
        }
    };

    (function(){
        var win=window,
            doc=document,
            domIsReady = false,
            domReadyQueue = [],
            readyState,
            isRunning = false,
            dom_onReady = function (){
                if (isRunning) return;
                isRunning = true;
                dom_onReady = Function.prototype;
                domIsReady = true;
                for (var i = 0; i < domReadyQueue.length; i++) {
                    domReadyQueue[i]();
                }
                domReadyQueue.length = 0;
                isRunning = false;
            };

        if ("readyState" in doc) {
            readyState = doc.readyState;
            domIsReady = readyState == "complete" || (~ navigator.userAgent.indexOf('AppleWebKit/') && (readyState == "loaded" || readyState == "interactive"));
        }
        else {
            domIsReady = !!doc.body;
        }

        if (!domIsReady) {
            if (win.addEventListener) {
                doc.addEventListener("DOMContentLoaded", dom_onReady, false);
            }
            else {
                doc.attachEvent("onreadystatechange", function(){
                    if (doc.readyState == "complete") {
                        dom_onReady();
                    }
                });
                if (doc.documentElement.doScroll && win === top) {
                    (function doScrollCheck(){
                        if (domIsReady) {
                            return;
                        }
                        try {
                            doc.documentElement.doScroll("left");
                        }
                        catch (e) {
                            setTimeout(doScrollCheck, 1);
                            return;
                        }
                        dom_onReady();
                    }());
                }
            }

            GJ.addEvent(win, "load", dom_onReady);
        }

        /**
         * 页面载入完成时触发的事件
         * @event GJ.onDomReady
         * @static
         * @param {Function} func 回调函数
         * @return {void}
         */
        GJ.onDomReady = function (fn, scope){
            if (domIsReady) {
                fn.call(scope);
                return;
            }
            domReadyQueue.push(function(){
                fn.call(scope);
            });
        };
    })();

    // 错误处理
    (function () {
        GJ.errorStack = [];
        var willSend = !GJ.config.debug && parseInt(Math.random() * 51) === 1;
        var flushedLen = 0;

        GJ.wrap = function (wrapper, fn) {
            if (typeof fn === 'function' && /^function/.test(fn.toString())) {
                return wrapper(fn);
            }

            return fn;
        }

        GJ.guard = function (target, prefix) {
            return function () {
                try {
                    return target.apply(this, arguments);
                } catch (ex) {
                    try {
                        GJ.errorStack.push({
                            'type': prefix || 'GJ_GUARD',
                            'message': ex.message || ex.toString(),
                            'stack': ex.stack,
                            'fn': target.toString().substr(0, 200)
                        });
                    } catch (exx) {}

                    throw ex;
                }
            }
        }

        GJ.goTry = function (prefix, fn) {
            return GJ.guard(fn, prefix);
        }

        var timer;
        GJ.errorManager = {
            send: function (msg, loc, type) {
                GJ.errorStack.push({
                    type: type,
                    message: msg,
                    loc: loc
                });
                clearTimeout(timer);
                timer = setTimeout(sendLog, 3000);
            }
        };

        function sendLog() {
            if (!willSend) {
                return;
            }
            if (flushedLen === GJ.errorStack.length) {
                return;
            }

            GJ.use('jquery', function ($) {
                flushedLen = GJ.errorStack.length;
                $.ajax({
                    url: '/jslogs.php',
                    type: 'POST',
                    data: {
                        'data': GJ.jsonEncode({
                            'stack': GJ.errorStack,
                            'url': window.location.href,
                            'referrer': document.referrer
                        })
                    },
                    error: function () {
                        GJ.use('log_tracker', function () {
                            GJ.LogTracker.trackEvent("javascript@atype=view"+
                                "@LOC="+encodeURIComponent(window.location.href)+
                                "@ERR="+encodeURIComponent("jslogs interface is not reachable!")+
                                "@TYPE="+encodeURIComponent("JSLOG_NOT_REACHABLE")
                            );
                        });
                    }
                });
            });
        }
    })();

    +function () {
        GJ.Deferred = function (){
            // state in ['pending', 'done', 'fail']
            var state = "pending";
            var callbacks = {
                    'done':     [],
                    'fail':     [],
                    'always':   []
                };
            // `args` will be the `arguments` of callbacks
            var args = [];

            function dispatch ( status, cb ) {
                if (typeof cb === 'function') {
                    if ( state === status || (status === 'always' && state !== 'pending') ) {
                        setTimeout( function () {
                            cb.apply( {}, args );
                        }, 0 );
                    } else {
                        callbacks[status].push( cb );
                    }
                } else if ( state === 'pending' ) { // only 'pending' can change to 'done' or 'fail'
                    state = status;
                    var cbs = callbacks[status];
                    var always = callbacks['always'];

                    while( (cb = cbs.shift()) || (cb = always.shift()) ) {
                        setTimeout( (function ( fn ) {
                            return function () {
                                fn.apply( {}, args );
                            }
                        })( cb ), 0 );
                    }
                }
            };

            return {
                state: function () {
                    return state;
                },
                done: function (cb) {
                    if (typeof cb === 'function') {
                        dispatch('done', cb);
                    } else {
                        args = [].slice.call(arguments);
                        dispatch('done');
                    }
                    return this;
                },
                fail: function (cb) {
                    if (typeof cb === 'function') {
                        dispatch('fail', cb);
                    } else {
                        args = [].slice.call(arguments);
                        dispatch('fail');
                    }
                    return this;
                },
                always: function (cb) {
                    if (typeof cb === 'function') {
                        dispatch('always', cb);
                    }
                    return this;
                },
                promise: function () {
                    return {
                        done: function (cb) {
                            if (typeof cb === 'function') {
                                dispatch('done', cb);
                            }
                            return this;
                        }
                        ,fail: function (cb) {
                            if (typeof cb === 'function') {
                                dispatch('fail', cb);
                            }
                            return this;
                        }
                        ,always: function (cb) {
                            if (typeof cb === 'function') {
                                dispatch('always', cb);
                            }
                            return this;
                        }
                        ,state: function () {
                            return state;
                        }
                    }
                }
            };
        };

        GJ.when = function (){
            var ret     = GJ.Deferred(),
                defers  = [].slice.call(arguments),
                len     = defers.length,
                count   = 0;
            if (!len) {
                return ret.done().promise();
            }
            for ( var i = defers.length - 1; i >= 0; i-- ) {
                defers[i].fail(function () {
                    ret.fail();
                }).done(function () {
                    if ( ++count === len ) {
                        ret.done();
                    }
                });
            };
            return ret.promise();
        }
    }();
    // GJ.Module
    +function () {
        var headNode = document.getElementsByTagName("head")[0], cfg=GJ.config;
        var versions = cfg.fileVersions, alias=cfg.fileCodes, combines = cfg.fileCombines;
        var debug = GJ.config.debug ? true : false;
        var defers = {};
        var eventList = [];
        var startTime = +new Date;

        GJ.defers = defers;
        GJ.eventList = eventList;
        var STATUS = {
            'ERROR'     : -2,
            'FAILED'    : -1,
            'FETCHING'  : 1,   // The module file is fetching now.
            'FETCHED'   : 2,   // The module file has been fetched.
            'SAVED'     : 3,   // The module info has been saved.
            'READY'     : 4,   // The module is waiting for dependencies
            'COMPILING' : 5,   // The module is in compiling now.
            'PAUSE'     : 6,
            'COMPILED'  : 7    // The module is compiled and module.exports is available.
        }
        var require = function (uri) {
            uri = require.resolve(uri)[0];
            if (require.cache[uri] && require.cache[uri].status === STATUS.COMPILED) {
                return require.cache[uri].exports;
            } else {
                throw new Error(uri+'尚未加载');
            }
        }
        require.resolve = function (uri) { // 处理别名，返回为一个uri数组
            var ret = [];
            if (alias[uri]) {
                if (typeof alias[uri] === 'string') {
                    alias[uri] = [alias[uri]];
                }
                GJ.each(alias[uri], function (u) {
                    GJ.each(require.resolve(u), function (i) {
                        ret.push(i);
                    });
                });
            } else {
                ret.push(uri);
            }
            return ret;
        }
        require.cache = {};

        GJ.Module = {
            STATUS: STATUS,
            cache: require.cache,
            fileLoaders: {
                ".js": jsLoader,
                ".css": cssLoader
            },
            find: function (uri) {
                return require.cache[require.resolve(uri)];
            }
        }

        var getAbsoluteUrl = function(uri, server){
            var _uri = uri.toLowerCase();
            if(_uri.indexOf('http:') === 0 || _uri.indexOf('https:') === 0){
                return uri;
            }

            if (uri.indexOf('./') === 0 || uri.indexOf('../') === 0) {
                var loc = window.location,
                    port = (loc.port ? ':' + loc.port : '');
                return loc.protocol + '//' + loc.host + port + '/' + uri;
            } else {
                if (!server) {
                    if (cfg.cdnFiles[uri]) {
                        server = 'http://stacdn201.ganjistatic1.com';
                    } else {
                        server = GJ.config.defaultServer;
                    }
                }

                if (server.indexOf('http') !== 0) {
                    server = 'http://' + server;
                }

                var version = getVersion(uri);

                return server + '/' + cfg.rootDir
                + uri.replace(/(\.(js|css|html?|swf|gif|png|jpe?g))$/i, ".__" + getVersion(uri) + "__$1");
            }
        };

        var now = new Date();
        var defaultVersionTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 21, 00).getTime();

        var getVersion = function(uri){
            var v = new Date().getTime();
            var version;
            if (cfg.fileVersions) {
                version = cfg.fileVersions[uri];
                if(!version) {
                    if(GJ.config.defaultVersion) {
                        version = GJ.config.defaultVersion;
                    } else {
                        if (v < defaultVersionTime) {
                            v = defaultVersionTime - 24 * 3600 * 1000;
                        } else {
                            v = defaultVersionTime;
                        }
                        version = parseInt(v/1000, 10);
                    }
                }
            }
            return version;
        };

        /**
         * 取得一个格式化的url
         * 根据一个相对url，取得添加了http://sta*.ganji.com域名与版本号的完整url
         * @method GJ.getFormatUrl
         * @static
         * @param {string} url 文件url，相对http://sta*.ganji.com/src指定
         * @param {string} hostname 域名。默认为空。如果不为空将使用此域名，否则随机生成sta*.ganji.com域名
         * @return {string}
         * @example
         * <script type="text/javascript">
         * var url = GJ.getFormatUrl('js/util/json/json.js');
         * //url的值：http://sta1.ganji.com/src/js/util/json/json.__2343654234__.js
         * var url = GJ.getFormatUrl('js/util/json/json.js', 'sta.ganji.com');
         * //url的值：http://sta.ganji.com/src/js/util/json/json.__2343654234__.js
         * </script>
         */
        GJ.getFormatUrl = function(url, hostname){
            var urls = require.resolve(url), ret=[];
            var ret = GJ.map(urls, function(url){
                return getAbsoluteUrl(url, hostname);
            });
            return ret.length === 1 ? ret[0] : ret;
        };

        /**
         * 同步载入一个或多个js、css文件
         * 采用document.write()方式载入。<br />代码要用script标签包装。<br />由于同步载入影响性能，一般不要使用
         * @method GJ.require
         * @static
         * @param {string|array} urls 可以是js、css文件url，也可以是一组文件的代号，多个可用逗号分隔，也可用数组。相对http://sta*.ganji.com/src指定
         * @return {void}
         * @example
         * <script type="text/javascript">
         * GJ.require('jquery,js/util/json/json.js');
         * GJ.require(['js/util/panel/panel.js', 'js/util/panel/panel.css']);
         * </script>
         */
        GJ.require = function(uris, onError){
            var doc=document;
            var deps = resolveDeps(uris);
            var files = [];
            if (debug) {
                GJ.each(deps, function (dep) {
                    if (combines[dep.uri]) {
                        GJ.each(resolveDeps(combines[dep.uri]), function (d) {
                            files.push(d);
                        });
                    } else {
                        files.push(dep);
                    }
                });
            } else {
                files = deps;
            }
            GJ.each(files, function(dep){
                var uri = dep.uri;
                dep.status = STATUS.FETCHING;
                if (GJ.isFunction(onError)) {
                    defers[dep.id].fail(onError);
                }
                if (/\.css$/i.test(uri)){
                    doc.write(unescape("%3Clink href='"+getAbsoluteUrl(uri)+"' type='text/css' rel='stylesheet' /%3E"));
                }
                else {
                    doc.write(unescape("%3Cscript src='"+getAbsoluteUrl(uri)+"' type='text/javascript'%3E%3C/script%3E"));
                }
            });
        };

        /**
         * 异步载入一个或多个js、css文件
         * @method GJ.use
         * @static
         * @param {string|array} urls 可以是js、css文件url，也可以是一组文件的代号，多个可用逗号分隔，也可用数组。相对http://sta*.ganji.com/src指定
         * @param {Function} onLoad 全部载入完成时的回调函数
         * @param {Function} onError 载入出错时的回调函数
         * @return {void}
         * @example
         * <script type="text/javascript">
         * GJ.use('jquery,js/util/json/json.js', function(){
         *     $('#id').html(GJ.jsonEncode({msg:'Hello World!'}));
         * });
         * </script>
         */
        GJ.use = function(dependencies, func, onError){
            var id = GJ.guid();
            dependencies = resolveDeps(dependencies);
            var module = require.cache[id] = {
                id              : id
                ,dependencies   : dependencies
                ,status         : STATUS.SAVED
                ,factory         : func
                ,onError        : onError
            }
            var defer = defers[id] = GJ.Deferred();
            if (GJ.isFunction(onError)) {
                defer.fail(onError);
            };
            eventList.push([-(startTime - new Date), 'use', id]);
            moduleWait(id);
        };
        require.async = GJ.use;

        /**
         * 通知文件已载入
         * 作为js文件编写模板
         * @method GJ.add
         * @static
         * @param {string} url 当前文件的url，相对http://sta*.ganji.com/src指定
         * @param {string|array} needUrls 所依赖的其它文件。可以是js、css文件url，也可以是一组文件的代号，多个可用逗号分隔，也可用数组。相对http://sta*.ganji.com/src指定
         * @param {Function} func 在所依赖的文件都载入后的回调函数。主体代码置于此函数中
         * @return {void}
         */
        GJ.add = function(uri, dependencies, func, onError){
            var module = require.cache[uri], defer = defers[uri];
            if (module && module.status >= STATUS.SAVED) { // 阻止重复载入模块
                GJ.log(uri+' 重复载入['+module.status+']');
                return;
            }

            if (GJ.isFunction(dependencies)) {
                onError = func;
                func = dependencies;
                dependencies = [];
            }

            dependencies = resolveDeps(dependencies);
            if (module) {
                module.dependencies = dependencies;
                module.status       = STATUS.SAVED;
                module.factory      = func;
                module.onError      = onError;
                module.exports      = {};
            } else {
                require.cache[uri] = {
                    id              : uri
                    ,uri            : uri
                    ,dependencies   : dependencies
                    ,status         : STATUS.SAVED
                    ,factory        : func
                    ,onError        : onError
                    ,exports        : {}
                }
                module = require.cache[uri];
            }
            if (!defer) {
                defer = defers[uri] = GJ.Deferred();
            }
            eventList.push([-(startTime - new Date), 'add', uri]);
            if (GJ.isFunction(onError)) {
                defer.fail(onError);
            };
            moduleWait(uri);
        };
        function moduleWait (uri) {
            var module = require.cache[uri];
            var toFetchDeps = [];
            eventList.push([-(startTime - new Date), 'waiting', uri]);
            GJ.each(module.dependencies, function (dep) {
                if (dep.status < STATUS.FETCHING) { // before fetching
                    toFetchDeps.push(dep.uri);
                }
            });
            GJ.each(toFetchDeps, function (uri) {
                loadFile(uri);
            });
            var depDefers = GJ.map(module.dependencies, function (dep) {
                return defers[dep.id];
            });
            GJ.when.apply({}, depDefers)
                .done(function () {
                    moduleReady(uri);
                });
        }
        function moduleReady (uri) {
            eventList.push([-(startTime - new Date), 'ready', uri]);
            var module = require.cache[uri], defer = defers[uri];
            module.exports = {};
            module.status = STATUS.READY;
            if (GJ.isFunction(module.factory)) {
                module.status = STATUS.COMPILING;
                try {
                    if (module.uri) { // GJ.add  =>  function (require, exports, module)
                        module.pause = function () {
                            module.status = STATUS.PAUSE;
                        }
                        module.resume = function () {
                            // keep clean
                            delete module.pause;
                            delete module.resume;

                            module.status = STATUS.COMPILED;
                            defer.done();
                        }
                        var ret = module.factory.call(window, require, module.exports, module);
                        if (ret) {
                            module.exports = ret;
                        }
                    } else { // GJ.use  =>  function (d1, d2, d3, d4)
                        var depExports = GJ.map(module.dependencies, function (dep) {
                            return dep.exports;
                        });
                        module.factory.apply(window, depExports);
                    }
                } catch (ex) {
                    // TODO: 更具体的调试信息，包括模块的调用栈(module.parent);
                    GJ.log('MOD: '+uri);
                    GJ.log('DEP: '+GJ.jsonEncode(GJ.map(module.dependencies, function (dep) {
                        return dep.id;
                    })));
                    GJ.log('ERR: '+ex.message);
                    module.status = STATUS.ERROR;
                    defer.fail();
                    var fnStr = module.factory.toString();
                    fnStr = fnStr.length > 150 ? fnStr.substr(0, 150) : fnStr;

                    GJ.errorStack.push({
                        'type': 'GJ_MODULE_CALLBACK_ERROR',
                        'message': ex.message,
                        'uri': uri,
                        'dependencies': GJ.jsonEncode(GJ.map(module.dependencies, function (dep) {
                            return dep.id;
                        })),
                        'stack': ex.stack,
                        'fn': fnStr
                    });

                    throw ex;
                }
            }
            if (module.status === STATUS.PAUSE) {
                return;
            } else {
                module.status = STATUS.COMPILED;
                defer.done();
            }
        }
        function cssLoader (uri) {
            // https://github.com/seajs/seajs/blob/master/src/util-fetch.js

            var UA = navigator.userAgent;

            // `onload` event is supported in WebKit since 535.23
            // Ref:
            //  - https://bugs.webkit.org/show_activity.cgi?id=38995
            var isOldWebKit = Number(UA.replace(/.*AppleWebKit\/(\d+)\..*/, '$1')) < 536;

            // `onload/onerror` event is supported since Firefox 9.0
            // Ref:
            //  - https://bugzilla.mozilla.org/show_bug.cgi?id=185236
            //  - https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
            var isOldFirefox = UA.indexOf('Firefox') > 0 &&
                !('onload' in document.createElement('link'));

            var module = require.cache[uri];
            var node = doc.createElement("link");
            var timer;
            node.setAttribute('type', "text/css");
            node.setAttribute('href', getAbsoluteUrl(uri));
            node.setAttribute('rel', 'stylesheet');

            if (isOldWebKit || isOldFirefox) {
                setTimeout(function() {
                    poll(node, onCSSLoad);
                }, 1) // Begin after node insertion
            } else {
                node.onload = onCSSLoad;
                node.onerror = function () {
                    clearTimeout(timer);
                    headNode.removeChild(node);
                    moduleFail(uri, 'Load Fail');
                }
            }

            module.status = STATUS.FETCHING;
            headNode.appendChild(node);

            timer = setTimeout(function () {
                headNode.removeChild(node);
                moduleFail(uri, 'Load timeout');
            }, 30000); // 30s
            function onCSSLoad() {
                clearTimeout(timer);
                eventList.push([-(startTime - new Date), 'loaded', uri]);
                if (module.status === STATUS.FETCHING) {
                    module.status = STATUS.FETCHED;
                }
                moduleReady(uri);
            }
            function poll(node, callback) {
                var isLoaded;
                if (isOldWebKit) {                // for WebKit < 536
                    if (node['sheet']) {
                        isLoaded = true;
                    }
                } else if (node['sheet']) {       // for Firefox < 9.0
                    try {
                        if (node['sheet'].cssRules) {
                            isLoaded = true;
                        }
                    } catch (ex) {
                    // The value of `ex.name` is changed from
                    // 'NS_ERROR_DOM_SECURITY_ERR' to 'SecurityError' since Firefox 13.0
                    // But Firefox is less than 9.0 in here, So it is ok to just rely on
                    // 'NS_ERROR_DOM_SECURITY_ERR'
                        if (ex.name === 'NS_ERROR_DOM_SECURITY_ERR') {
                            isLoaded = true;
                        }
                    }
                }

                setTimeout(function() {
                    if (isLoaded) {
                        // Place callback in here due to giving time for style rendering.
                        callback();
                    } else {
                        poll(node, callback);
                    }
                }, 1);
            }

            return node;
        }


        function jsLoader (uri, onLoad) {
            var module = require.cache[uri];
            var timer;

            loadFromRemote();

            function loadFromRemote() {
                var timer = setTimeout(function () {
                    headNode.removeChild(node);
                    moduleFail(uri, 'Load timeout');
                }, 30000); // 30s
                var node = doc.createElement("script");
                var done = false;
                node.setAttribute('type', "text/javascript");
                node.setAttribute('src', getAbsoluteUrl(uri));
                node.setAttribute('async', true);

                node.onload = node.onreadystatechange = function(){
                    if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")){
                        done = true;
                        clearTimeout(timer);
                        eventList.push([-(startTime - new Date), 'loaded', uri]);
                        if (module.status === STATUS.FETCHING) {
                            module.status = STATUS.FETCHED;
                        }
                        if (GJ.isFunction(onLoad)) {
                            onLoad();
                        }
                        // 如果一个文件在script.onload之后状态还未变为STATUS.SAVED
                        // 则说明这个文件为外部文件
                        if (module.status < STATUS.SAVED) {
                            if (!/^http/.test(uri)) {
                                GJ.log('模块ID错误: '+uri);
                                GJ.tralog('GJ_ADD_INVALIDATE', uri);
                                if(!GJ.config.debug) {
                                    GJ.setCookie('use_https', 1, 86400); // 1 天
                                    GJ.config.defaultServer = 'https://sta.ganji.com';
                                }

                            } else {
                                moduleReady(uri);
                            }
                        }
                    }
                };

                node.onerror = function(e){
                    clearTimeout(timer);
                    headNode.removeChild(node);
                    moduleFail(uri, 'Load Fail');
                };
                module.status = STATUS.FETCHING;
                headNode.appendChild(node);
            }
        }
        function cmbFileLoader (uri) {
            var deps = combines[uri];
            var loader;
            if (!deps) {
                throw new Error(uri+'is not a combined js file');
            }
            deps = resolveDeps(deps);
            if (!debug) {
                // 将合并文件中的js文件标记为STATUS.FETCHING，防止重复抓取
                GJ.each(deps, function (dep) {
                    if (dep.status < STATUS.FETCHING && dep.uri.indexOf('.js') !== -1) {
                        dep.status = STATUS.FETCHING;
                    }
                });

                // 加载合并文件
                if (uri.indexOf('.css') === -1) {
                    loader = jsLoader;
                } else {
                    loader = cssLoader;
                }

                loader(uri, function () {
                    GJ.add(uri, combines[uri]);
                });
            } else {
                GJ.add(uri, combines[uri]);
            }
        }
        function loadFile (uri){
            eventList.push([-(startTime - new Date), 'fetching', uri]);
            if (combines[uri]) {
                return cmbFileLoader(uri);
            }
            var loaders = GJ.Module.fileLoaders;
            // TODO: jsonLoader
            for (var t in loaders) {
                if (loaders.hasOwnProperty(t)) {
                    if (uri.indexOf(t) !== -1) {
                        return loaders[t](uri);
                    }
                }
            }
            // default type is JS
            return loaders['.js'].call({
                require     : require
                ,defers     : defers
            }, uri);
        }
        var retryList = {}, defaultServerIndex = 0;
        function moduleFail (uri, reason) {
            if (retryList[uri]) {
                require.cache[uri].status = STATUS.FAILED;
                defers[uri].fail();
                GJ.errorStack.push({
                    'type': 'GJ_MODULE_FAIL',
                    'message': reason,
                    'uri': uri
                });
                throw new Error(reason + ": " + getAbsoluteUrl(uri));
            } else {
                retryList[uri] = true;

                if (/^http/.test(uri)) {
                    throw new Error(reason + ': ' + uri);
                }

                GJ.tralog('MODULE_LOAD_FAIL', GJ.config.defaultServer + ' - ' + uri);

                defaultServerIndex = defaultServerIndex+1 >= GJ.config.servers.length ? 0 : defaultServerIndex + 1;
                GJ.config.defaultServer = GJ.config.servers[defaultServerIndex];
                GJ.setCookie('STA_DS', defaultServerIndex);
                loadFile(uri);
            }
        }
        function resolveDeps (dependencies) {
            var deps = [];
            if (dependencies && typeof dependencies === 'string') {
                dependencies = dependencies.replace(/^ */, "");
                dependencies = dependencies.split(/[, \r\n\t\f]+/);
            }
            GJ.each(dependencies, function (uri) {
                GJ.each(require.resolve(uri), function (u) {
                    if (GJ.inArray(u, deps) === -1) {
                        deps.push(u);
                    }
                });
            });
            deps = GJ.map(deps, function (dep) {
                if (!require.cache[dep]) {
                    require.cache[dep] = {
                        id              : dep
                        ,uri            : dep
                        ,dependencies   : []
                        ,status         : 0
                    }
                    defers[dep] = GJ.Deferred();
                }
                return require.cache[dep];
            });
            return deps;
        }
    }();
    /**
     * 远程跨域调用url后，执行回调函数
     *
     * @method GJ.jsonp
     * @static
     * @param {string|array} url 访问的文件url，url中不能包含callbackName和postData两个参数
     * @param {object} postData 要传递的数据，将进行json编码，服务器端通过josn_decode($_GET['postData'])获取
     * @param {Function} onLoad 全部载入完成时的回调函数
     * @param {Function} onError 载入出错时的回调函数
     * @param {string} callbackName 要传递的函数名，可以为空，服务器端通过$_GET['callbackName']获取
     * @return {void}
     */
    GJ.jsonp = function(url, postData, onLoad, onError, callbackName){
        if (!url) {
            alert('[GJ.jsonp]url不能为空 ');
            return;
        }

        if (GJ.isFunction(postData)) {
            callbackName = onError;
            onError = onLoad;
            onLoad = postData;
            postData = {};
        }

        if (!callbackName) {
            callbackName = GJ.guid();
        }

        url += url.indexOf('?') === -1 ? '?' : '&';
        url += 'postData=' + encodeURIComponent(GJ.jsonEncode(postData));
        url += '&callbackName=' + encodeURIComponent(callbackName);

        var doc=document, n, executed = false,
            doError = function(){
                if (!executed && GJ.isFunction(onError)) {
                    executed = true;
                    onError();
                }
            };

        var head = document.getElementsByTagName("head")[0];

        window[callbackName] = function(ret){
            executed = true;
            if (GJ.isFunction(onLoad)){
                onLoad(ret);
            }
        };

        n = doc.createElement("script");
        n.setAttribute('type', "text/javascript");
        n.setAttribute('src', url);
        n.setAttribute('async', true);

        var timer = GJ.later(function(){
            doError();
            GJ.error("文件载入失败: '"+url+"'");
            head.removeChild(n);
        }, 30 * 1000, false);

        var done = false;
        n.onload = n.onreadystatechange = function(){
            if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")){
                done = true;
                timer.cancel();
                doError();
            }
        };

        n.onerror = function(e){
            timer.cancel();
            doError();
            GJ.error(e + ": " + url);
            head.removeChild(n);
        };

        head.appendChild(n);
    };


    /**
     * 浏览器信息
     * 包括：
     * <ul>
     *     <li><strong>ie</strong> &nbsp; &nbsp; ie版本号。0表示非ie浏览器</li>
     *     <li><strong>opera</strong> &nbsp; &nbsp; Opera版本号。</li>
     *     <li><strong>gecko</strong> &nbsp; &nbsp; Gecko引擎版本号。</li>
     *     <li><strong>webkit</strong> &nbsp; &nbsp; AppleWebKit版本号。</li>
     *     <li><strong>chrome</strong> &nbsp; &nbsp; Chrome版本号。</li>
     *     <li><strong>mobile</strong> &nbsp; &nbsp; mobile属性。</li>
     *     <li><strong>air</strong> &nbsp; &nbsp; Adobe AIR版本号。</li>
     *     <li><strong>ipad</strong> &nbsp; &nbsp; Apple iPad's OS版本号。</li>
     *     <li><strong>iphone</strong> &nbsp; &nbsp; Apple iPhone's OS版本号。</li>
     *     <li><strong>ipod</strong> &nbsp; &nbsp; Apple iPod's OS版本号。</li>
     *     <li><strong>ios</strong> &nbsp; &nbsp; General truthy check for iPad, iPhone or iPod。</li>
     *     <li><strong>android</strong> &nbsp; &nbsp; Googles Android OS版本号。</li>
     *     <li><strong>caja</strong> &nbsp; &nbsp; Google Caja版本号。</li>
     *     <li><strong>secure</strong> &nbsp; &nbsp; 是否使用ssl安全协议。</li>
     *     <li><strong>os</strong> &nbsp; &nbsp; 操作系统。</li>
     * </ul>
     * @property GJ.ua
     * @static
     * @type object
     */
    GJ.ua = function() {
        var numberify = function(s) {
                var c = 0;
                return parseFloat(s.replace(/\./g, function() {
                    return (c++ == 1) ? '' : '.';
                }));
            },
            nav = win && win.navigator,
            ua = nav && nav.userAgent,
            loc = win && win.location,
            href = loc && loc.href,
            m,
            o = {
                ie: 0,
                opera: 0,
                gecko: 0,
                webkit: 0,
                chrome: 0,
                mobile: null,
                air: 0,
                ipad: 0,
                iphone: 0,
                ipod: 0,
                ios: null,
                android: 0,
                caja: nav && nav.cajaVersion,
                secure: false,
                os: null,
                isqplus: false,
                is360app: false
            };

        o.secure = href && (href.toLowerCase().indexOf("https") === 0);

        if (ua) {
            if ((/windows|win32/i).test(ua)) {
                o.os = 'windows';
            } else if ((/macintosh/i).test(ua)) {
                o.os = 'macintosh';
            } else if ((/rhino/i).test(ua)) {
                o.os = 'rhino';
            }

            if ((/KHTML/).test(ua)) {
                o.webkit=1;
            }

            m=ua.match(/AppleWebKit\/([^\s]*)/);
            if (m&&m[1]) {
                o.webkit=numberify(m[1]);

                if (/ Mobile\//.test(ua)) {
                    o.mobile = "Apple";

                    m = ua.match(/OS ([^\s]*)/);
                    if (m && m[1]) {
                        m = numberify(m[1].replace('_', '.'));
                    }
                    o.ipad = (navigator.platform == 'iPad') ? m : 0;
                    o.ipod = (navigator.platform == 'iPod') ? m : 0;
                    o.iphone = (navigator.platform == 'iPhone') ? m : 0;
                    o.ios = o.ipad || o.iphone || o.ipod;
                } else {
                    m=ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/);
                    if (m) {
                        o.mobile = m[0];
                    }
                    if (/ Android/.test(ua)) {
                        o.mobile = 'Android';
                        m = ua.match(/Android ([^\s]*);/);
                        if (m && m[1]) {
                            o.android = numberify(m[1]);
                        }
                    }
                }

                m=ua.match(/Chrome\/([^\s]*)/);
                if (m && m[1]) {
                    o.chrome = numberify(m[1]);
                } else {
                    m=ua.match(/AdobeAIR\/([^\s]*)/);
                    if (m) {
                        o.air = m[0];
                    }
                }
            }

            if (!o.webkit) {
                m=ua.match(/Opera[\s\/]([^\s]*)/);
                if (m&&m[1]) {
                    o.opera=numberify(m[1]);
                    m=ua.match(/Opera Mini[^;]*/);
                    if (m) {
                        o.mobile = m[0];
                    }
                } else {
                    m=ua.match(/MSIE\s([^;]*)/);
                    if (m&&m[1]) {
                        o.ie=numberify(m[1]);
                    } else {
                        m=ua.match(/Gecko\/([^\s]*)/);
                        if (m) {
                            o.gecko=1;
                            m=ua.match(/rv:([^\s\)]*)/);
                            if (m&&m[1]) {
                                o.gecko=numberify(m[1]);
                            }
                        }
                    }
                    var re  = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
                    if (re.exec(ua) != null) {
                          o.ie = parseFloat( RegExp.$1 );
                    }
                }
            }
        }

        try {
            if (win.external && win.external.qplus && GJ.isObject(win.external.qplus)){
                o.isqplus = true;
            }

            if(!o.isqplus && win.external && win.external.wappGetAppId && win.external.wappGetAppId()){
                o.is360app = true;
            }
        }
        catch (e) { }
        return o;
    }();

    /**
     * 取得当前页面可见区域的座标与长宽
     * @method GJ.getViewPort
     * @static
     * @return {object} 返回一个对象，包含4个下标：left、top、width和height
     */
    GJ.getViewPort = function()
    {
        var doc=document, b = doc.body, de = doc.documentElement, mode = doc.compatMode,
            width = self.innerWidth, height = self.innerHeight

        if (mode || GJ.ua.ie){ // IE, Gecko, Opera
            width = (mode == 'CSS1Compat') ? de.clientWidth : b.clientWidth;
            if (!GJ.ua.opera ) height = (mode == 'CSS1Compat') ? de.clientHeight : b.clientHeight;
        }

        return {
            left: Math.max(de.scrollLeft, b.scrollLeft),
            top: Math.max(de.scrollTop, b.scrollTop),
            width: width,
            height: height
        };
    };

    /**
     * 去掉字符串首尾空格
     * @method GJ.trim
     * @static
     * @param {string} str 要处理的字符串
     * @return {string} 返回去掉首尾空格的字符串
     */
    GJ.trim = function(s)
    {
        return s.replace(/^\s+/, '').replace(/\s+$/, '');
    };

    /**
     * 格式化字符串
     * 将字符串中的'%s'用指定的字符串变量替换
     * @method GJ.sprintf
     * @static
     * @param {string} str 要处理的字符串
     * @param {string} var* 用来替换的多个字符串
     * @return {string} 返回替换后的字符串
     * @example
     * <script type="text/javascript">
     * var str = GJ.sprintf('1%s2%s3%s', 'a', 'b', 'c');
     * </script>
     */
    GJ.sprintf = function(str, var1, var2)
    {
        var arg = arguments,
            str = arg[0] || '',
            i, n;
        for (i = 1, n = arg.length; i < n; i++) {
            str = str.replace(/%s/, arg[i]);
        }
        return str;
    };

    /**
     * 分析url，取得相关信息
     * @method GJ.parseUrl
     * @static
     * @param {string} url 要分析的url，可以是绝对或相对url
     * @return {object} 返回一个包含相关信息的对象
     * @modify @ 2012/4/24 by huangdegang@ganji.com , fix bug:In IE6, the pathname of an anchor element when set by a relative URL is blank.
     */
    GJ.parseUrl = function (url) {
        var doc = document,
            loc = doc.location,
            a =  doc.createElement('a');

        url = url || loc.href;
        if (url.indexOf('://') === -1 && GJ.ua.ie) {
            var _url = loc.protocol + '//' + loc.host;
            if (url.indexOf('/') === 0) {
                _url += url;
            } else {
                _url += loc.pathname.replace(/\/[\w\.]+$/, '/') + url;
            }
            url = _url;
        }

        a.href = url;
        var data = {
            source: url,
            protocol: a.protocol.replace(':',''),
            host: a.hostname,
            port: a.port,
            query: a.search,
            params: (function(){
                var ret = {},
                    //sea = a.search || url.replace(/^[^\?]+/, '').replace(/#.*$/, ''),
                    sea = url.replace(/^[^\?]+/, '').replace(/#.*$/, ''),
                    seg = sea.replace(/^\?/,'').split('&'),
                    len = seg.length, i = 0, s;
                for (;i<len;i++) {
                    if (!seg[i]) { continue; }
                    s = seg[i].split('=');
                    ret[s[0]] = s[1] || '';
                }
                return ret;
            })(),
            file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
            hash: a.hash.replace('#',''),
            path: a.pathname.replace(/^([^\/])/,'/$1'),
            relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
            segments: a.pathname.replace(/^\//,'').split('/')
        };
        return data;
    };

    /**
     * 检测flashplayer的版本是否可用
     * @method GJ.checkFlashPlayer
     * @static
     * @param {string} version 需要的flashplayer版本号
     * @return {boolean} 当安装了flashplayer并且版本号足够，返回true
     */
    GJ.checkFlashPlayer = function(version) {
        var nav = navigator,
            d = null,
            v = version.split("."),
            pv = [0,0,0];

        if (typeof nav.plugins != "undefined" && typeof nav.plugins["Shockwave Flash"] == "object") {
            d = nav.plugins["Shockwave Flash"].description;
            if (d && !(typeof nav.mimeTypes != "undefined" && nav.mimeTypes["application/x-shockwave-flash"] && !nav.mimeTypes["application/x-shockwave-flash"].enabledPlugin)) {
                d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                pv[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
                pv[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
                pv[2] = /[a-zA-Z]/.test(d) ? parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
            }
        }
        else if (typeof window.ActiveXObject != "undefined") {
            try {
                var a = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                if (a) {
                    d = a.GetVariable("$version");
                    if (d) {
                        d = d.split(" ")[1].split(",");
                        pv = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
                    }
                }
            }
            catch(e) {}
        }

        v[0] = parseInt(v[0], 10);
        v[1] = parseInt(v[1], 10) || 0;
        v[2] = parseInt(v[2], 10) || 0;
        return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
    };

    (function(){
        var cssNode;
        /**
         * 创建css
         * @method GJ.createCSS
         * @static
         * @param {string} name className名称
         * @param {string} style className值
         * @return {void}
         */
        GJ.createCSS = function (name, style){
            if (GJ.ua.ie && GJ.ua.mac){ return; }
            try
            {
                var doc=document, h = doc.getElementsByTagName("head")[0];
                if (!h){ return; }
                if (!cssNode){
                    var s = doc.createElement("style");
                    s.setAttribute("type", "text/css");
                    cssNode = h.insertBefore(s, h.firstChild);
                    //cssNode = h.appendChild(s);
                    if (GJ.ua.ie && GJ.ua.os == 'win' && !GJ.isUndefined(doc.styleSheets) && doc.styleSheets.length > 0){
                        cssNode = doc.styleSheets[doc.styleSheets.length - 1];
                    }
                }

                if (GJ.ua.ie && GJ.ua.os == 'win'){
                    if (cssNode && GJ.isFunction(cssNode.addRule)){
                        cssNode.addRule(name, style);
                    }
                }
                else {
                    if (cssNode && GJ.isFunction(doc.createTextNode)){
                        cssNode.appendChild(doc.createTextNode(name + " {" + style + "}"));
                    }
                }
            }
            catch (e){}
        };
    })();

    /**
     * 创建一个loading提示
     * @method GJ.createLoading
     * @static
     * @param {object} el 定位loading图标时相对的元素，如果为空，则定位在页面中间
     * @param {position} position 相对于el的方位，默认为center，还可以为left或right
     * @return {object} 返回一个包含remove()方法的对象
     * @example
     * <script type="text/javascript">
     * $('#btn_id').click(function(){
     *     var loading = GJ.createLoading($('#btn_id'), 'right');
     *     $.get('http://you.domain.com/ajax.php', function(data){
     *         loading.remove();
     *         ...
     *     });
     * });
     * </script>
     */
    GJ.createLoading = function(el, position){
        var div = 1,
            imgLoading = {
                remove : function(){
                    if (div){
                        div.hide().remove();
                    }
                    div = null;
                }
            };
        GJ.use('jquery', function(){
            if (div === 1){
                div = $('<div style="width:16px;height:16px;z-index:9000000;position:absolute;background-image:url('+GJ.getFormatUrl('js/util/ganji/loading.gif')+');"></div>');
                $body = $('body');
                if ($body.size() == 0) return;
                $body.append(div);
                if (!el) {
                    var pos = GJ.getViewPort(),
                        left = pos.left + Math.round((pos.width  - div.width()) / 2.0),
                        top  = pos.top  + Math.round((pos.height - div.height()) / 2.0);
                    div.css({top:Math.max(0, top), left:Math.max(0, left)});
                }
                else {
                    var $el = $(el), ofs = $el.offset(), left, top;
                    if (!position) position = 'center';
                    if (position == 'center'){
                        left = ofs.left + Math.round(($el.width()  - div.width()) / 2.0);
                    }
                    else if (position == 'right'){
                        left = ofs.left + $el.width() + 5;
                    }
                    else if (position == 'left'){
                        left = ofs.left - div.width() - 5;
                    }
                    top  = ofs.top  + Math.round(($el.height() - div.height()) / 2.0);
                    div.css({top:top, left:left});
                }
                div.show();
            }
        });
        return imgLoading;
    };

    /**
     * 为元素绑定事件，事件在下载相关文件后触发
     * 该动作只会触发一次
     * @method GJ.oneEvent
     * @static
     * @param {string|object} elementId 要绑定事件的元素的id号，或对象
     * @param {string} type 触发类型，如click
     * @param {string|array} urls 需要下载的js或css文件
     * @param {Function} func 需要触发的事件
     * @param {boolean} stop 是否阻止冒泡，默认阻止
     * @return {void}
     * @example
     * <script type="text/javascript">
     * GJ.bindEvent('btn_id', 'click', 'js/util/json/json.js', function(){
     *     GJ.setCookie('cookieName', GJ.jsonEncode({key:'val'}));
     * });
     * </script>
     */
    GJ.oneEvent = function(btnObj, eventType, needUrls, func, stop){
        GJ.use('jquery', function(){
            var $btnObj = GJ.isString(btnObj) ? $('#'+btnObj) : $(btnObj);
            if (!$btnObj || $btnObj.size() == 0){
                return;
            }
            $btnObj.one(eventType, function(e){
                var t = this,
                    loading = GJ.createLoading(t);
                GJ.use(needUrls, function(){
                    loading.remove();
                    func.apply(t, [e]);
                });
                return !!stop;
            });
        });
    };

    (function(){
        var win=window, doc=document;

        //IE6背景图缓存，防止ff下出错，加try..catch
        try {
            doc.execCommand("BackgroundImageCache", false, true);
        }
        catch(e){}

        //去掉flash的虚边
        GJ.createCSS('object', 'outline:none;');

        //设置document.domain
        var dm = GJ.config.documentDomain;
        if (dm){
            //var host=win.location.hostname.toLowerCase();
            //if (host.indexOf(dm.toLowerCase()) > -1) {
                doc.domain = dm;
            //}
        }
        //doc.domain = 'ganji.com';

        var _setAllLinkTargetIsSelf = function(){
           GJ.use('jquery', function(){
               $('a').attr('target', '_self');
           });
        }
        //360app在当前窗口显示
        GJ.addEvent(win, "load", function(){
            var win=window;
            if(GJ.ua.isqplus){
                GJ.use('app_qplus', function(){
                  GJ.qplus.init();
                });
            }else if (GJ.ua.is360app) {
                _setAllLinkTargetIsSelf();
            }
        });

        //注销当前页面时统计外部文件的使用
    })();

    GJ.add('js/util/ganji/ganji.js');

})();

(function(){
    if (GJ.jsonEncode) return;

    (function(){
        var _UNICODE_EXCEPTIONS = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,

            _ESCAPES = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,

            _VALUES  = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,

            _BRACKETS = /(?:^|:|,)(?:\s*\[)+/g,

            _UNSAFE = /[^\],:{}\s]/,

            _escapeException = function (c) {
                return '\\u'+('0000'+(+(c.charCodeAt(0))).toString(16)).slice(-4);
            },

            _parse = function (s,reviver) {
                s = s.replace(_UNICODE_EXCEPTIONS, _escapeException);

                if (!_UNSAFE.test(s.replace(_ESCAPES,'@').
                                    replace(_VALUES,']').
                                    replace(_BRACKETS,''))) {

                    return eval('(' + s + ')');
                }

                throw new SyntaxError('JSON.parse');
            };

        /**
         * 将json字符串解析为js对象
         *
         * @method GJ.jsonDecode
         * @param {string} jsonString 要解析的字符串
         * @return {object} 返回解析出来的js对象
         * @example
         * <script type="text/javascript">
         * GJ.use('json', function(){
         *     var obj = GJ.jsonDecode('{"key1":"val1","key2":"val2"}');
         * });
         * </script>
         */
        GJ.jsonDecode = function (s) {
            if (!GJ.isString(s)) {
                s += '';
            }

            return _parse(s);
        };
    })();

    (function(){
        var isFunction= GJ.isFunction,
            isObject  = GJ.isObject,
            isArray   = GJ.isArray,
            _toStr    = Object.prototype.toString,
            UNDEFINED = 'undefined',
            OBJECT    = 'object',
            NULL      = 'null',
            STRING    = 'string',
            NUMBER    = 'number',
            BOOLEAN   = 'boolean',
            DATE      = 'date',
            _allowable= {
                'undefined'        : UNDEFINED,
                'string'           : STRING,
                '[object String]'  : STRING,
                'number'           : NUMBER,
                '[object Number]'  : NUMBER,
                'boolean'          : BOOLEAN,
                '[object Boolean]' : BOOLEAN,
                '[object Date]'    : DATE,
                '[object RegExp]'  : OBJECT
            },

            _SPECIAL_CHARS = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,

            _CHARS = {
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"' : '\\"',
                '\\': '\\\\'
            },

            dateToString = function (d) {
                function _zeroPad(v) {
                    return v < 10 ? '0' + v : v;
                }

                return d.getUTCFullYear()           + '-' +
                      _zeroPad(d.getUTCMonth() + 1) + '-' +
                      _zeroPad(d.getUTCDate())      + 'T' +
                      _zeroPad(d.getUTCHours())     + ':' +
                      _zeroPad(d.getUTCMinutes())   + ':' +
                      _zeroPad(d.getUTCSeconds())   + 'Z';
            };


        function _type(o) {
            var t = typeof o;
            return  _allowable[t] ||
                    _allowable[_toStr.call(o)] ||
                    (t === OBJECT ?
                        (o ? OBJECT : NULL) :
                        UNDEFINED);
        }

        function _char(c) {
            if (!_CHARS[c]) {
                _CHARS[c] =  '\\u'+('0000'+(+(c.charCodeAt(0))).toString(16)).slice(-4);
            }
            return _CHARS[c];
        }

        function _string(s) {
            return '"' + s.replace(_SPECIAL_CHARS, _char) + '"';
        }

        function _indent(s,space) {
            return s.replace(/^/gm, space);
        }

        function _stringify(o,space) {
            if (o === undefined) {
                return undefined;
            }

            var w = null;

            var format   = _toStr.call(space).match(/String|Number/) || [],
                stack    = [];

            space = format[0] === 'Number' ?
                        new Array(Math.min(Math.max(0,space),10)+1).join(" ") :
                        (space || '').slice(0,10);

            function _serialize(h,key) {
                var value = h[key],
                    t     = _type(value),
                    a     = [],
                    colon = space ? ': ' : ':',
                    arr, i, keys, k, v;

                if (isObject(value) && isFunction(value.toJSON)) {
                    value = value.toJSON(key);
                } else if (t === DATE) {
                    value = dateToString(value);
                }

                if (value !== h[key]) {
                    t = _type(value);
                }

                switch (t) {
                    case DATE    :
                    case OBJECT  : break;
                    case STRING  : return _string(value);
                    case NUMBER  : return isFinite(value) ? value+'' : NULL;
                    case BOOLEAN : return value+'';
                    case NULL    : return NULL;
                    default      : return undefined;
                }

                for (i = stack.length - 1; i >= 0; --i) {
                    if (stack[i] === value) {
                        throw new Error("JSON.stringify. Cyclical reference");
                    }
                }

                arr = isArray(value);

                stack.push(value);

                if (arr) {
                    for (i = value.length - 1; i >= 0; --i) {
                        a[i] = _serialize(value, i) || NULL;
                    }
                } else {
                    keys = w || value;
                    i = 0;

                    for (k in keys) {
                        if (keys.hasOwnProperty(k)) {
                            v = _serialize(value, k);
                            if (v) {
                                a[i++] = _string(k) + colon + v;
                            }
                        }
                    }
                }

                stack.pop();

                if (space && a.length) {
                    return arr ?
                        '[' + "\n" + _indent(a.join(",\n"), space) + "\n" + ']' :
                        '{' + "\n" + _indent(a.join(",\n"), space) + "\n" + '}';
                } else {
                    return arr ?
                        '[' + a.join(',') + ']' :
                        '{' + a.join(',') + '}';
                }
            }

            return _serialize({'':o},'');
        }

        /**
         * 将js对象编码为json字符串
         *
         * @method GJ.jsonEncode
         * @param {string} jsObject 要编码的js对象
         * @param {string|int} space 格式化显示时的空格或空格数
         * @return {string} 返回json字符串
         * @example
         * <script type="text/javascript">
         * GJ.use('json', function(){
         *     var obj = {
         *         key1 : "val1",
         *         key2 : "val2"
         *     },
         *     str = GJ.jsonEncode(obj);
         * });
         * </script>
         */
        GJ.jsonEncode = function (o, ind) {
            return _stringify(o, ind);
        };
    })();

    GJ.add('js/util/json/json.js');


})();

window.onerror = function (err, url, lineNumber) {
    GJ.errorManager.send(err, url + '[' + lineNumber+']', 'WINDOW_ON_ERROR');
}

if (window.location.href.indexOf('use_https') !== -1) {
    GJ.setCookie('use_https', 1, 86400);
}

if (GJ.getCookie('use_https')) {
    GJ.defaultServer = 'https://sta.ganji.com';
}

if (window.location.href.indexOf('version_test_t') !== -1) {
    GJ.setCookie('version_test_t', 1, 86400);
}