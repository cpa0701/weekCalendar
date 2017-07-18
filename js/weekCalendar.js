/**
 * Created by ccc on 2017/7/11.
 */
//初始化详情页面
var WeekCalendar = function (func1, func2) {
    var weekCalendar_plugin = {
        init: function () {
            //设置全局同步
            $.ajaxSetup({
                async: false, //设置全局ajax同步
                cache: false //设置全局ajax不缓存
            });

            //第一步：初始化其他页面传过来的参数
            weekCalendar_plugin.initParams();
            // 第二步，初始化控件
            weekCalendar_plugin.initControl();
            //第三步:绑定事件
            weekCalendar_plugin.bindEvent();
        },
        initParams: function () {//第一步：初始化其他页面传过来的参数
            weekCalendar_plugin.getNowDate();
            weekCalendar_plugin.theMonth = weekCalendar_plugin.nowMonth; //当前月（不变）
            $(".wcMonth").children('li:eq(' + weekCalendar_plugin.theMonth + ')').addClass("today");
            weekCalendar_plugin.theYear = weekCalendar_plugin.nowYear;//当前年（不变）
            weekCalendar_plugin.weekStartDate = '';
            weekCalendar_plugin.startDateMonth = '';
            weekCalendar_plugin.weekEndDate = '';
            weekCalendar_plugin.StartDay = 0;
            weekCalendar_plugin.EndDay = 0;
        },
        initControl: function () {// 第二步，初始化控件
            weekCalendar_plugin.getStartAndEndDay();
            weekCalendar_plugin.initWeekCalendar(weekCalendar_plugin.StartDay, weekCalendar_plugin.EndDay, weekCalendar_plugin.nowDay, weekCalendar_plugin.nowYear, weekCalendar_plugin.startDateMonth);
        },
        //第三步:绑定事件
        bindEvent: function () {
            //点击周历显示相应进行周历跳转和显示当日事件
            $(".wcDate>li").click(function (e) {
                var StartDay = '';
                var EndDay = '';
                var lastWeekStartDate = '';
                var lastWeekEndDate = '';
                if ($(e.target).text().indexOf("上周") == -1 && $(e.target).text().indexOf("下周") == -1) {
                    $(".wcDate>li.active").removeClass('active');
                    $(this).addClass('active');
                    weekCalendar_plugin.getNowDate($(".wcDate>li.active").attr("data-date"));
                    weekCalendar_plugin.getStartAndEndDay();
                    weekCalendar_plugin.initWeekCalendar(weekCalendar_plugin.StartDay, weekCalendar_plugin.EndDay, weekCalendar_plugin.theDay, weekCalendar_plugin.nowYear, weekCalendar_plugin.startDateMonth);
                    if (func1)
                        func1($(this).attr("data-date").substr(0, 4), $(this).attr("data-date").substr(5, 2) - 1, $(this).attr("data-date").substr(8, 2), $(this).find("span:last-of-type").text());
                } else {
                    if ($(e.target).text().indexOf("上周") != -1) {
                        lastWeekStartDate = weekCalendar_plugin.getLastWeekDate(7);
                        lastWeekEndDate = weekCalendar_plugin.getLastWeekDate(1);
                    } else {
                        lastWeekStartDate = weekCalendar_plugin.getLastWeekDate(-7);
                        lastWeekEndDate = weekCalendar_plugin.getLastWeekDate(-13);
                    }
                    StartDay = parseInt(lastWeekStartDate.substr(8, 2));
                    EndDay = parseInt(lastWeekEndDate.substr(8, 2));
                    weekCalendar_plugin.nowMonth = parseInt(lastWeekStartDate.substr(5, 2)) - 1;
                    weekCalendar_plugin.startDateMonth = weekCalendar_plugin.nowMonth;
                    weekCalendar_plugin.nowYear = parseInt(lastWeekStartDate.substr(0, 4));
                    weekCalendar_plugin.nowMonth = weekCalendar_plugin.getPositiveMonth(weekCalendar_plugin.nowMonth) % 12 + 1;
                    if (weekCalendar_plugin.nowMonth < 10) {
                        weekCalendar_plugin.nowMonth = "0" + weekCalendar_plugin.nowMonth;
                    }
                    $(".wcDate>li.active").removeClass('active');
                    weekCalendar_plugin.getNowDate(weekCalendar_plugin.nowYear + '-' + weekCalendar_plugin.nowMonth + '-' + StartDay);
                    weekCalendar_plugin.getStartAndEndDay();
                    weekCalendar_plugin.initWeekCalendar(StartDay, EndDay, weekCalendar_plugin.theDay, weekCalendar_plugin.nowYear, weekCalendar_plugin.startDateMonth);
                }
            });
            //点击月份显示对应周历
            $(".wcMonth>li").click(function (e) {
                $(".wcMonth>li.active").removeClass('active');
                $(this).addClass("active");
                $(".wcDate>li.active").removeClass('active');
                weekCalendar_plugin.getNowDate(weekCalendar_plugin.nowYear + '-' + $(this).attr('data-month') + '-01');
                weekCalendar_plugin.getStartAndEndDay();
                weekCalendar_plugin.initWeekCalendar(weekCalendar_plugin.StartDay, weekCalendar_plugin.EndDay, weekCalendar_plugin.nowDay, weekCalendar_plugin.nowYear, weekCalendar_plugin.startDateMonth);
            });
            //点击年份显示对应周历
            $(".wcYear").on('click', 'i', function (e) {
                var nowYear = '';
                if ($(e.target).attr('data-change') == 'pre') {
                    nowYear = parseInt(e.target.nextSibling.nodeValue) - 1;
                } else {
                    nowYear = parseInt(e.target.previousSibling.nodeValue) + 1;
                }
                weekCalendar_plugin.getNowDate(nowYear + '-' + $(".wcMonth>li.active").attr('data-month') + '-01');
                weekCalendar_plugin.getStartAndEndDay();
                weekCalendar_plugin.initWeekCalendar(weekCalendar_plugin.StartDay, weekCalendar_plugin.EndDay, weekCalendar_plugin.nowDay, weekCalendar_plugin.nowYear, weekCalendar_plugin.startDateMonth);
                $(".wcDate>li.active").removeClass('active');
            });
            //鼠标移入和移出月份和日期时背景变化
            $(".wcDate>li,.wcMonth>li").mouseover(function (e) {
                if ($(e.target).attr("data-month")) {
                    $(".wcMonth>li.mouseActive").removeClass('mouseActive');
                    $(this).addClass("mouseActive");
                } else if ($(e.target).children().length != 0) {
                    $(".wcDate>li.mouseActive").removeClass('mouseActive');
                    $(this).addClass("mouseActive");
                }
            }).mouseleave(function () {
                $(".wcMonth>li.mouseActive").removeClass('mouseActive');
                $(".wcDate>li.mouseActive").removeClass('mouseActive');
            });
        },
        //获得上周或下周开头结尾日期
        getLastWeekDate: function (n) {
            var now = new Date($(".wcDate>li:eq(1)").attr('data-date'));
            var year = now.getFullYear();
            //因为月份是从0开始的,所以获取这个月的月份数要加1才行
            var month = now.getMonth() + 1;
            var date = now.getDate();
            var day = now.getDay();
            //判断是否为周日,如果不是的话,就让今天的day-1(例如星期二就是2-1)
            if (day !== 0) {
                n = n + (day - 1);
            }
            else {
                n = n + day;
            }
            if (day) {
                //这个判断是为了解决跨年的问题
                if (month > 1) {
                    //month = month;
                }
                //这个判断是为了解决跨年的问题,月份是从0开始的
                else {
                    year = year - 1;
                    month = 12;
                }
            }
            now.setDate(now.getDate() - n);
            year = now.getFullYear();
            month = now.getMonth() + 1;
            date = now.getDate();
            s = year + "-" + (month < 10 ? ('0' + month) : month) + "-" + (date < 10 ? ('0' + date) : date);
            return s;
        },
        //获得正数月数
        getPositiveMonth: function (month) {
            var i = 0;
            do {
                month = month + 12 * i;
                i++;
            }
            while (month < 0);
            return month;
        },
        //获得当前日，月，年
        getNowDate: function (date) {
            if (date)
                weekCalendar_plugin.now = new Date(date); //当前日期
            else {
                weekCalendar_plugin.now = new Date(); //当前日期
                weekCalendar_plugin.theDay = weekCalendar_plugin.now.getDate(); //当前日
            }
            weekCalendar_plugin.nowDayOfWeek = weekCalendar_plugin.now.getDay(); //今天本周的第几天
            weekCalendar_plugin.nowDay = weekCalendar_plugin.now.getDate(); //当前日
            weekCalendar_plugin.nowMonth = weekCalendar_plugin.now.getMonth(); //当前月
            weekCalendar_plugin.nowYear = weekCalendar_plugin.now.getYear(); //当前年
            weekCalendar_plugin.nowYear += (weekCalendar_plugin.nowYear < 2000) ? 1900 : 0; //
        },
        //获得本周开头结尾日期
        getStartAndEndDay: function () {
            weekCalendar_plugin.weekStartDate = weekCalendar_plugin.getWeekStartDate();
            weekCalendar_plugin.weekEndDate = weekCalendar_plugin.getWeekEndDate();
            weekCalendar_plugin.startDateMonth = parseInt(weekCalendar_plugin.weekStartDate.substr(5, 2)) - 1;
            $.each($(".wcDate").find('li'), function (a, b) {
                if (a > 0 && a < 8) {
                    var date = new Date(weekCalendar_plugin.nowYear, weekCalendar_plugin.nowMonth, weekCalendar_plugin.nowDay + (a - 1 - weekCalendar_plugin.nowDayOfWeek));
                    date = weekCalendar_plugin.formatDate(date);
                    $(b).attr("data-date", date);
                }
            });
            weekCalendar_plugin.StartDay = parseInt(weekCalendar_plugin.weekStartDate.substr(8, 2));
            weekCalendar_plugin.EndDay = parseInt(weekCalendar_plugin.weekEndDate.substr(8, 2));
        },
        //获得本周的开端日期
        getWeekStartDate: function () {
            var weekStartDate = new Date(weekCalendar_plugin.nowYear, weekCalendar_plugin.nowMonth, weekCalendar_plugin.nowDay - weekCalendar_plugin.nowDayOfWeek);
            return weekCalendar_plugin.formatDate(weekStartDate);
        },
        //获得本周的停止日期
        getWeekEndDate: function () {
            var weekEndDate = new Date(weekCalendar_plugin.nowYear, weekCalendar_plugin.nowMonth, weekCalendar_plugin.nowDay + (6 - weekCalendar_plugin.nowDayOfWeek));
            return weekCalendar_plugin.formatDate(weekEndDate);
        },
        //格局化日期：yyyy-MM-dd
        formatDate: function (date) {
            var myyear = date.getFullYear();
            var mymonth = date.getMonth() + 1;
            var myweekday = date.getDate();

            if (mymonth < 10) {
                mymonth = "0" + mymonth;
            }
            if (myweekday < 10) {
                myweekday = "0" + myweekday;
            }
            return (myyear + "-" + mymonth + "-" + myweekday);
        },
        //生成本周日历
        initWeekCalendar: function (StartDay, EndDay, today, nowYear, nowMonth) {
            var i = StartDay;
            if (StartDay < EndDay) {
                $.each($(".wcDate").find('li>span:first-of-type'), function (a, b) {
                    if (i < 10) {
                        i = "0" + i;
                    }
                    $(b).text(i);
                    i = parseInt(i);
                    if (i == today && weekCalendar_plugin.nowMonth == weekCalendar_plugin.theMonth && nowYear == weekCalendar_plugin.theYear) {
                        $(b).parent().addClass('today');
                    } else {
                        $(b).parent().removeClass('today');
                    }
                    i++;
                });
            } else {
                var MonthEndDate = weekCalendar_plugin.getMonthEndDate(nowYear, nowMonth);
                var j = 1;
                $.each($(".wcDate").find('li>span:first-of-type'), function (a, b) {
                    if (i <= new Date(MonthEndDate).getDate()) {
                        $(b).text(i);
                        i = parseInt(i);
                        if (i == today && weekCalendar_plugin.nowMonth == weekCalendar_plugin.theMonth && nowYear == weekCalendar_plugin.theYear) {
                            $(b).parent().addClass('today');
                        } else {
                            $(b).parent().removeClass('today');
                        }
                        i++;
                    } else {
                        if (j <= EndDay) {
                            $(b).text("0" + j);
                            if (j == today && weekCalendar_plugin.nowMonth == weekCalendar_plugin.theMonth && nowYear == weekCalendar_plugin.theYear) {
                                $(b).parent().addClass('today');
                            } else {
                                $(b).parent().removeClass('today');
                            }
                            j++;
                        }
                    }
                });
            }
            //显示当前年
            $(".wcYear").html('<i data-change="pre"></i>' + weekCalendar_plugin.nowYear + '<i data-change="next"></i>');
            //显示当前月
            $(".wcMonth").children('li').removeClass("active");
            weekCalendar_plugin.nowMonth = weekCalendar_plugin.getPositiveMonth(weekCalendar_plugin.nowMonth) % 12;
            $(".wcMonth").children('li:eq(' + weekCalendar_plugin.nowMonth + ')').addClass("active");
            if (func2)
                func2();
        },
        //获得本月的开端日期
        getMonthStartDate: function (nowYear, nowMonth) {
            var monthStartDate = new Date(nowYear, nowMonth, 1);
            return weekCalendar_plugin.formatDate(monthStartDate);
        },

        //获得本月的停止日期
        getMonthEndDate: function (nowYear, nowMonth) {
            var monthEndDate = new Date(nowYear, nowMonth, weekCalendar_plugin.getMonthDays(nowYear, nowMonth));
            return weekCalendar_plugin.formatDate(monthEndDate);
        },
        //获得某月的天数
        getMonthDays: function (nowYear, myMonth) {
            var monthStartDate = new Date(nowYear, myMonth, 1);
            var monthEndDate = new Date(nowYear, myMonth + 1, 1);
            return (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
        }
    };
    weekCalendar_plugin.init();
};