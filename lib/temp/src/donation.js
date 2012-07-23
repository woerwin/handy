//业务处理
define(function(require, exports, module) {
    var $ = require('zepto');
    var Handlebars = require('handlebars');
    var PageTransition = require('pageTransition');
    var Validator = require('validator-core');
    var Overlay = require('overlay');
    var Mask = require('mask');
    /*
     *** 函数区
     */
    var renderLoading = function () {
        //配置loading
        var loading_tpl = $('#loading-tpl');
        if (loading_tpl.length) {
            var source = loading_tpl.html();
            var tpl = Handlebars.compile(source);
            $(document.body).prepend(tpl());
            loading_overlay = new Overlay({
                element: '#J-loading',
                align: {
                    selfXY: ['50%', '50%'],
                    baseXY: ['50%', '50%']
                }
            });
            loading_mask = new Mask();
            //配置到api接口上
            hybridapi.loading.set({
                show: function () {
                    refreshMask();
                    loading_mask.show();
                    loading_overlay.show();
                },
                hide: function () {
                    loading_mask.hide();
                    loading_overlay.hide();
                }
            });
        }
    },
        orientationEvent = function () {
            //页面旋转及缩放时的处理
            PT.sync();
            refreshMask();
        },
        refreshMask = function () {
            //重新渲染mask和loading
            loading_mask && loading_mask.set('style', {
                'width': $(document).width() + 'px',
                'height': $(document).height() + 'px'
            });
            //因为overlay的set方法有延迟，固放到延时函数中
            setTimeout(function () {
                loading_overlay && loading_overlay.set('align', loading_overlay.get('align'));
            }, 10);
        },
        renderMain = function () {
            //渲染主体
            var source, tpl;
            source = $('#page-box-tpl').html();
            tpl = Handlebars.compile(source);
            $('#main').prepend(tpl());
            source = $('#donationList-tpl').html();
            tpl = Handlebars.compile(source);
            $('#J-page-1').html(tpl());
        },
        renderDonationList = function () {
            //渲染列表
            var donationDataList = $('#J-donationDataList');
            var _success = function (body) {
                var serviceData = body.serviceData;
                if (serviceData.dataCount > 0) {
                    pagebar.dataCount = parseInt(serviceData.dataCount);
                    //更新分页数据
                    pagebar.refresh();
                    //
                    var html = '';
                    for (var i = 0; i < serviceData.dataList.length; i++) {
                        var source = $('#donationListItem-tpl').html(),
                            tpl = Handlebars.compile(source);
                        html += tpl({
                            data: serviceData.dataList[i],
                            datavalue: JSON.stringify(serviceData.dataList[i])
                        });
                    }
                    //第一页替换原有内容，后面的页追加
                    if (pagebar.pageNum == 1) {
                        donationDataList.html('');
                    }
                    donationDataList.append(html);
                    //客户端中隐藏更多内的回顶部
                    var moreTrigger = $('#J-moreTrigger');
                    if (hybridConfig.isAlipayClient) {
                        $('[data-action=more]', moreTrigger).css({
                            'border-right': '0',
                            'width': '100%'
                        });
                        //客户端去掉回顶部功能
                        $('[data-action=top]', moreTrigger).hide();
                    }
                    //显示更多
                    if (pagebar.pageCount > 1 && pagebar.pageNum < pagebar.pageCount) {
                        moreTrigger.removeClass('hide').addClass('btn-more');
                    } else {
                        //大于等于最大页数
                        if (hybridConfig.isAlipayClient) {
                            //客户端，隐藏更多
                            moreTrigger.removeClass('btn-more').addClass('hide');
                        } else {
                            //浏览器，隐藏更多，只显示回顶部
                            $('[data-action=top]', moreTrigger).css({
                                'border-right': '0',
                                'width': '100%'
                            });
                            //客户端去掉回顶部功能
                            $('[data-action=more]', moreTrigger).hide();
                        }
                    }
                    //第一页隐藏地址栏
                    if (pagebar.pageNum == 1) {
                        hybridapi.gotoTop();
                    }
                } else {
                    var source = $('#noDonationItem-tpl').html(),
                        tpl = Handlebars.compile(source);
                    donationDataList.html(tpl());
                }
            },
                _error = function (xhr, type) {},
                options = hybridapi.initAjaxOptions({
                    type: 'POST',
                    url: datasource.alias['donation-list'],
                    data: {
                        pageNum: pagebar.pageNum,
                        pageSize: pagebar.pageSize
                    },
                    dataType: 'json',
                    success: _success,
                    error: _error
                });
            $.ajax(options);
        },
        bindEvent = function () {
            //绑定更多
            $('#J-moreTrigger a[data-action=more]').live(TOUCH_EV, function (e) {
                e.preventDefault();
                pagebar.pageNum++;
                renderDonationList();
            });
            $('#J-moreTrigger a[data-action=top]').live(TOUCH_EV, function (e) {
                e.preventDefault();
                hybridapi.gotoTop();
            });
            //绑定捐赠条目
            $('#J-donationDataList [data-nextPage]').live(TOUCH_EV, function (e) {
                e.preventDefault();
                var el = $(this),
                    nextPage = el.attr('data-nextPage');
                //获取当前捐赠项目的值
                donationData = JSON.parse(el.attr('data-value'));
                var options = hybridapi.initAjaxOptions({
                    type: 'POST',
                    url: datasource.alias['donation-detail'],
                    data: {
                        donate_name: donationData.donate_name
                    },
                    dataType: 'json',
                    success: function (body) {
                        var source = $('#donationDetail-tpl').html(),
                            tpl = Handlebars.compile(source);
                        $(nextPage).html(tpl(body.serviceData));
                        pageflow.go(nextPage);
                        //初使化详情
                        $('.donation-detail').each(function () {
                            var self = $(this);
                            if (self.height() > 60) {
                                self.css({
                                    'height': '60px',
                                    'overflow': 'hidden'
                                });
                                self.next('.more').show();
                            }
                        });
                        renderDetailValidator();
                    },
                    error: function (xhr, type) {}
                });
                $.ajax(options);
            });
            //绑定确认捐赠按钮
            $('#J-donationApply-trigger').live(TOUCH_EV, function (e) {
                e.preventDefault();
                //验证整个表单
                Validator.query('#donationForm').execute();
            });
            //绑定确定支付按钮
            $('#J-pay-trigger').live(TOUCH_EV, function (e) {
                e.preventDefault();
                var el = $(this),
                    nextPage = el.attr('data-nextPage');
                var options = hybridapi.initAjaxOptions({
                    type: 'POST',
                    url: datasource.alias['donation-confirm'],
                    data: {
                        donate_name: donationData.donate_name,
                        amount: donationData.amount
                    },
                    dataType: 'json',
                    success: function (body) {},
                    error: function (xhr, type) {}
                });
                $.ajax(options);
            });
            //绑定查看详情
            $('.donation-detail ~ .more').live(TOUCH_EV, function () {
                $(this).hide();
                $('.donation-detail').css({
                    'height': 'auto',
                    'overflow': 'visible'
                });
            });
            //常用金额
            $('#donationForm [data-donationAmount]').live(TOUCH_EV, function () {
                $('#donationForm input[name=amount]').val($(this).attr('data-donationAmount'));
            });
        },
        renderDetailValidator = function () {
            //渲染详情页的验证
            try {
                //尝试销毁上一个Validator实例
                Validator.query('#donationForm').destroy();
            } catch (err) {};
            //添加validator
            var validator = new wapValidator({
                element: '#donationForm',
                //阻止表单验证通过后的自动提交，场景：手机虚拟键盘的"前往"会触发提交动作
                autoSubmit: false,
                onFormValidated: function (ele, err) {
                    var showMessage = Validator.query(ele).get('showMessage');
                    if (!err) {
                        var nextPage = $('#donationForm').attr('data-nextPage');
                        //必须放到excute中获取amount的值，否则amount四舍五入后的值获取不到
                        var amount = $('#donationForm input[name=amount]').val() || '';
                        donationData.amount = amount;
                        var options = hybridapi.initAjaxOptions({
                            type: 'POST',
                            url: datasource.alias['donation-apply'],
                            data: {
                                donate_name: donationData.donate_name,
                                amount: donationData.amount
                            },
                            dataType: 'json',
                            success: function (body) {
                                var fieldError = body.serviceData.fieldError;
                                if (body.errorCode == '501') {
                                    for (var i in fieldError) {
                                        showMessage.call(Validator.query(ele), fieldError[i], $('#donationForm [name=' + i + ']'));
                                    }
                                } else {
                                    var source = $('#donationApply-tpl').html(),
                                        tpl = Handlebars.compile(source);
                                    $(nextPage).html(tpl(body.serviceData));
                                    pageflow.go(nextPage);
                                }
                            },
                            error: function (xhr, type) {}
                        });
                        $.ajax(options);
                    }
                }
            });
            validator.addItem({
                element: '[name=amount]',
                required: true,
                rule: 'number amount max{max:2000}',
                display: '金额'
            });
        };
    /*
     *** 初使化区
     */
    /*
     *** 组件初使化
     */
    //规则不允许覆盖，所以在外层先添加规则
    Validator.addRule('amount', function (options) {
        var val = options.element.val();
        if (!isNaN(val)) {
            val = Math.round(val * 100) / 100;
            options.element.val(val);
            return /^[0-9]+(\.[0-9]{0,2})?$/.test(val);
        } else {
            return false;
        }
    }, '{{display}}格式有误。');
    //因为没有针对wap单独的validator,所以临时扩展一个
    var wapValidator = Validator.extend({
        getError: function (ele) {
            var itemNode = this.getItem(ele),
                errorNode = itemNode.find('.fm-error');
            if (errorNode.length == 0) {
                errorNode = $('<div class="fm-error"></div>').prependTo(itemNode);
            }
            return errorNode;
        },
        getItem: function (ele) {
            return ele.closest('.fm-item');
        },
        attrs: {
            triggerType: '',
            showMessage: function (msg, ele) {
                var errorNode = this.getError(ele);
                errorNode.html(msg).show();
            },
            hideMessage: function (msg, ele) {
                var errorNode = this.getError(ele);
                errorNode.html('').hide();
            }
        }
    }),
        //页面滚动组件
        PT = new PageTransition({
            element: '#J-page-box',
            duration: 0
        }),
        //初使化页面流
        pageflow = hybridapi.pageflow.set({
            first: '#J-page-1',
            go: function (page) {
                PT.transition(page);
            },
            back: function (page) {
                PT.back();
            }
        }),
        //分页
        pagebar = new hybridapi.Pagebar();
    /*
     *** 业务初使化
     */
    //合理选用事件，先暂时用click
    var TOUCH_EV = 'ontouchstart' in window ? 'click' : 'click';
    var datasource = hybridConfig.datasource,
        //保存捐赠的临时数据
        donationData;
    if (!hybridConfig.isAlipayClient) {
        var loading_overlay, loading_mask;
        renderLoading();
        //设备旋转
        var orientationchange = 'onorientationchange' in window ? 'orientationchange' : 'resize';
        $(document).bind(orientationchange, orientationEvent);
    }
    $(document).ready(function () {
        renderMain();
        PT.render();
        bindEvent();
        hybridapi.ready(function () {
            renderDonationList();
        });
    });
});

