;
(function ($, undefined) {

    "use strict";

    $.fn.tablefilter = function (option) {
        var $this = $(this);
        var data = $this.data('tablefilter');
        var options = typeof option === 'object' && option;

        if (!data) {
            $this.data('tablefilter', (data = new TableFilter(this, $.extend({}, $.fn.tablefilter.defaults, options))));
        }
    };

    $.fn.tablefilter.defaults = {
        targetColumnNames: [],
        selectedAction: function ($target) {
            $target.fadeIn("fast");
        },
        unselectedAction: function ($target) {
            $target.fadeOut("fast");
        },
        optionsCaption: '選択してください'
    };

    var TableFilter = function (table, options) {

        this.table = $(table);
        this.selectedAction = options.selectedAction;
        this.unselectedAction = options.unselectedAction;
        this.columnNames = options.targetColumnNames;
        this.optionsCaption = options.optionsCaption;
        this.columnIndexes = [];
        this.selectors = [];

        this.setColumnIndexes();  // target column position
        this.setSelectors(); // set each selector
    };

    TableFilter.prototype = {
        constructor: TableFilter,
        setColumnIndexes: function () {
            var self = this;

            // if column names have not been set, default target will be all columns.
            if (self.columnNames.length === 0) {
                self.table.find('thead tr').each(function () {
                    $(this).find('th').each(function (index) {
                        self.columnIndexes.push(index);
                    });
                });
                return;
            }

            self.table.find('thead tr').each(function () {
                $(this).find('th').each(function (index) {
                    var eachTh = this;
                    $.each(self.columnNames, function (i) {
                        if ($(eachTh).text() === self.columnNames[i]) {
                            self.columnIndexes.push(index);
                        }
                    });
                });
            });
        },
        getOptions: function (columnIndex) {
            var self = this;
            var options = [];

            self.table.find('tbody tr')
                .each(function () {
                    $(this).find('td').eq(columnIndex).each(function () {
                        options.push($(this).text());
                    });
                });
            return options;
        },
        // selectorに必要なoptionの項目を抽出する
        createSelectorTemplate: function (columnIndex) {

            var self = this;

            var options = self.getOptions(columnIndex);
            var sortedUniquerOptions = TFGlobal.uniqueArray(options).sort();

            var defaultOption = '<option>' + self.optionsCaption + '</option>';
            var options = TFGlobal.createOptionTemplate(sortedUniquerOptions);

            var selectorTemplate = '<select>' + defaultOption + options + '</select>';

            return selectorTemplate;
        },
        setSelectors: function () {

            var self = this;

            $.each(self.columnIndexes, function (index) {
                // TODO theadの下に改行をいれる。よくない。。。
                $('<br/>').appendTo(self.table.find('thead').find('th').eq(self.columnIndexes[index]));

                var selector = $(self.createSelectorTemplate(self.columnIndexes[index]))
                    .appendTo(self.table
                        .find('thead')
                        .find('th')
                        .eq(self.columnIndexes[index])[0]); // 選択selector

                // 1つでも選択項目が変化したら全てのセレクタを見て、AND条件でフィルタリングする
                selector.on("change", function () {
                    console.log('選択されました');
                    self.filterAll();
                });

                self.selectors.push(selector);
            });
        },
        filterAll: function () {
            console.log('### filterAll START');
            var self = this;

            $.each(self.selectors, function () {
                self.table.find('tbody tr').each(function () {
                    var results = self.checkFilterCondition(this);
                    self.checkAndAction(this, results);
                });
            });

            console.log('### filterAll END');
        },
        checkFilterCondition: function (tr) {
            var self = this;
            var results = [];
            $(tr).each(function () {
                var tds = ($(this).find('td'));
                $.each(self.columnIndexes, function (index) {
                    var tdText = $(tds[self.columnIndexes[index]]).text();
                    var selectorText = $(self.selectors[index]).val();
                    if (selectorText === undefined || selectorText === self.optionsCaption || selectorText === tdText) {
                        results.push(true);
                    } else {
                        results.push(false);
                    }
                });
            });
            return results;
        },
        checkAndAction: function (tr, results) {
            var self = this;
            // falseが存在しなければ、選択時のActionを実行する
            if ($.inArray(false, results) === -1) {
                self.selectedAction($(tr));
            } else {
                self.unselectedAction($(tr));
            }
        }
    }

    var TFGlobal = {

        uniqueArray: function (array) {
            var storage = {};
            var uniqueArray = [];
            var value;
            $.each(array, function (index) {
                value = array[index];
                if (!(value in storage)) {
                    storage[value] = true;
                    uniqueArray.push(value);
                }
            });
            return uniqueArray;
        },
        createOptionTemplate: function (array) {
            var html = '';
            $.each(array, function (index) {
                html += '<option>' + array[index] + '</option>';
            });
            return html;
        }
    }

})(jQuery);