var _personService = abp.services.app.person;

(function () {
    $(function () {
        var _$modal = $("#PersonCreateModal");

        var _$form = _$modal.find("form");

        _$form.validate();

        _$form.find('button[type="submit"]').click(function (e) {
            e.preventDefault();
            if (!_$form.valid()) {
                return;
            }

            var personEditDto = _$form.serializeFormToObject();
            abp.ui.setBusy(_$modal);
            _personService.createOrUpdatePersonAsync({ personEditDto }).done(function () {
                _$modal.modal("hide");

                location.reload(true); //reload page to see new person!
            }).always(function () {
                abp.ui.clearBusy(_$modal);
            });
        });
        _$modal.on("shown.bs.modal", function () {
            _$modal.find("input:not([type=hidden]):first").focus();
        });

        //使用web api实现无刷新分页

        var totalPages = 0;
        var totalCount = 0;
        var currentPage = 1;
        totalCount = $('input[name=totalPages]').val();
        totalPages = totalCount % 10 == 0 ? totalCount / 10 : parseInt(totalCount/10+1);
        var options = {
            bootstrapMajorVersion: 3,
            alignment: "center",//居中显示
            currentPage: currentPage,//当前页数
            totalPages: totalPages,//总页数 注意不是总条数
            onPageClicked: function (e, originalEvent, type, page) {
                _personService.getPagedPersonsAsync({ skipCount: (page - 1) * 10 })
                .done(function (data) {
                    if(data.totalCount>0)
                    {
                        //构建HTML代码
                        var strHtml = getStrHtml(data);
                        $('tbody').html(strHtml);
                        currentPage = page;
                    }
                });
            }
        };
        $('.pagination').bootstrapPaginator(options);

        //get html string
        var getStrHtml = function (data) {
            var strHtml = "";
            //构建HTML代码
            for(item in data.items)
            {
                strHtml= strHtml+'<tr><td><a href="javascript:void()" data-toggle="modal" data-target="#PersonCreateModal" onclick="editPerson('
					   +item.id+');">编辑</a>| <a href="javascript:void()" onclick="deletePerson('
					   +item.Id+');"> 删除</a></td>'
		               +'<td>'+item.name +'</td>'
					   +'<td>'+item.emailAdderss +'</td>'
					   +'<td>'+item.creationTime +'</td>'
					   +'<tr>'
					   +'<th>电话类型</th>'
					   +'<th>电话号码</th>'
					   +'</tr>';
					   
                for(phone in item.phones)
                {
                    strHtml=strHtml +'<tr>'
					   +'<td>'+ phone.type + '</td>'
					   +'<td>'+ phone.number+ '</td>'
					   +'</tr>'
					   +'</tr>';
                }
					  
            }
            return strHtml;
        }

        //使用web api实现无刷新分页 结束
    });
})();

function editPerson(id) {
    _personService.getPersonForEditAsync({ id: id }).done(function (data) {
        $("input[name=Name]").val(data.person.name);
        $("input[name=EmailAddress]").val(data.person.emailAddress);
        $("input[name=Id]").val(data.person.id);
    });
}

function deletePerson(id) {
    abp.message.confirm(
        "是否删除Id为" + id + "的联系人信息", function () {
            _personService.deletePersonAsync({ id: id }).done(function () {
                location.reload(true);
            });
        }
    );
}