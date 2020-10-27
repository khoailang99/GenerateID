import Pagination from './pagination.js';

class ID {
  constructor(totalIds, defaultPageNumbs, originalProdNumb = 8) {
    this.grossProd = totalIds;
    this.defaultPageNumbs = defaultPageNumbs;
    this.originalProdNumb = originalProdNumb;
    this.defaultPageNumbs = defaultPageNumbs;
    this.totalPages = Math.ceil(this.grossProd / this.originalProdNumb);
    this.objPagination = null;
    this.prevElem = null;
  } 

  // Thêm sự kiện click cho các mục ID
  triggerClickEvItemIds() {
    let objID = this;
    $(".lun__item-nameId").each(function(index, elem){
      if($(elem).find(".item-nameId__value").attr('data-idUsed') == "true") {
        $(elem).find('.item-nameId__value').prev().find('.us__unused, .us__used').toggleClass('active');
        return;
      }
      $(elem).find(".item-nameId__value").click(function(evt){
        // if(objID.prevElem != null) {
        //   objID.activeDeactiveOnIDElems(objID.prevElem);
        // }
        objID.activeDeactiveOnIDElems(this);
      });
    });
  }

  // Kích hoạt và hủy kích hoạt trên phần tử ID
  activeDeactiveOnIDElems(elem) {
    let objID = this;
    $(elem).prev().find('.us__unused, .us__used').toggleClass('active');
    $(elem).children('.in__v__notice-copied').toggleClass('active');
    
    if($(elem).attr('data-activation-status') == '1') {
      $(elem).attr("data-activation-status","0");
      return;
    }

    objID.copyFunction($(elem).children().first().text().trim());
    $(elem).attr("data-activation-status","1");
    objID.prevElem = elem;
  }

  // Xử lý chức năng copy khi người dùng click
  copyFunction(txtElemClicked) {
    // Create a "hidden" input
    let elemInput = document.createElement("input");

    // Assign it the value of the specified element
    elemInput.setAttribute("value", txtElemClicked);

    // Append it to the body
    document.body.appendChild(elemInput);

    // Highlight its content
    elemInput.select();

    elemInput.setSelectionRange(0, 99999); /*For mobile devices*/

    // Copy the highlighted text
    document.execCommand("copy");

    // Remove it from the body
    document.body.removeChild(elemInput);
  }

  // Thêm sự kiện focusout cho input page
  triggerFocusoutEvInputPage() {
    $('.aic__input-page').focusout(function(e) {
      let page = Number(e.target.value);
      if(!this.checkInputPage()) {
        this.triggerNotification(`Giá trị lớn hơn ${$(e.target).attr('min')} và nhỏ hơn ${$(e.target).attr('max')}`, 'error', 3);
        return; 
      }
      this.updateIdList(page, $('.checked_ids__checkbox').is(":checked")?true:null, $('.unchecked_ids__checkbox').is(":checked")?false:null, null);
      this.objPagination.updateStatusValuePagingBtns(page, Number(document.querySelector("button.active").getAttribute('data-page')))
      $(e.target).attr('data-err',"false");
    }.bind(this));
  }

  // Kiểm tra giá trị của input page có thỏa mãn < max và > min ko
  checkInputPage() {
    let page = Number($('.aic__input-page').val().trim());
    if(page < Number($('.aic__input-page').attr('min')) || page > Number($('.aic__input-page').attr('max'))) {
      return false;
    }
    return true;
  }

  // Thêm sự kiện click cho checkbook used và unused
  triggerClickEvCheckb() {
    let objID = this;
    $('.checked_ids__checkbox').click(function(e){
      if(!objID.checkInputPage()) { return; }
      objID.getListNewIdsAccordingToCond(1, true, $('.unchecked_ids__checkbox').prop("checked")?false:null,null);
    });
    $('.unchecked_ids__checkbox').click(function(e){
      if(!objID.checkInputPage()) { return; }
      objID.getListNewIdsAccordingToCond(1, $('.checked_ids__checkbox').prop("checked")?true:null, false,null);
    });
  }

  // Thêm sự kiên click cho nút cập nhật
  triggerClickEvUpdateBtn() {
    let objID = this;
    $('.update_ids__btn').click(function(){
      if($('.checked_ids__checkbox').is(":checked") || !objID.checkInputPage()) { return; }
      let arrIds = [];
      $('.item-nameId__value').each((index, elem) => {
        if($(elem).attr('data-activation-status') == "1") {
          arrIds.push($(elem).children().first().text())
        }
      });
      if(arrIds.length == 0) {
        objID.triggerNotification("Không có ID nào được chọn", 'error', 3);
        return;
      }
      objID.getListNewIdsAccordingToCond(1,null,false,arrIds);
    });
  }

  getListNewIdsAccordingToCond(page = 1, used, unused, arrIds) {
    axios.get('/danh-sach-id', {
      params: { page, used, unused, arrIds }
    })
    .then(function (result) {
      $('.list-unique-name').html(result.data);
      this.triggerClickEvItemIds();
      this.grossProd = Number($('.lun__item-totalIds').attr('data-totalIds'));
      this.totalPages = Math.ceil(this.grossProd / this.originalProdNumb);
      let objPagination = new Pagination(this.totalPages, this.defaultPageNumbs);
      objPagination.pagingInit();
      $('.aic__input-page').val(1).attr('max', this.totalPages);
      this.triggerClickEvPagingBtns(objPagination);
    }.bind(this))
    .catch(function (error) {
      console.log("Lỗi lấy danh sách ID!");
    })
  }

  // Thêm sự kiện click cho các nút phân trang
  triggerClickEvPagingBtns(objPagination) {
    let objID = this;
    let valTargetBtn = 0, prevPage = 0; 
    document.querySelectorAll(".pa__list-page-numbers button").forEach((elem) => {
      elem.addEventListener("click", (e) => {
        valTargetBtn = Number(elem.getAttribute('data-page'));
        prevPage = Number($("button.active").attr('data-page'));
        if (valTargetBtn < 1 || valTargetBtn > this.totalPages || prevPage == valTargetBtn) { return false; }

        objID.updateIdList(valTargetBtn, $('.checked_ids__checkbox').is(":checked")?true:null, $('.unchecked_ids__checkbox').is(":checked")?false:null, null);
        objID.objPagination.updateStatusValuePagingBtns(valTargetBtn, prevPage)
        $('.aic__input-page').val(valTargetBtn);
      }, false);
    });
  }

  // Cập nhật danh sách ID mới vào danh sách ID cũ đang hiển thị
  updateIdList(page, used, unused, arrIds) {
    let objID = this;
    axios.get('/danh-sach-id', {
      params: { page, used, unused, arrIds }
    })
    .then(function (result) {
      $('.list-unique-name').html(result.data);
      this.triggerClickEvItemIds();
    }.bind(this))
    .catch(function (error) {
      console.log("Lỗi lấy danh sách ID!");
    })
  }

  // JS Query Media - (min-width: 400px)
  checkMatchMedia_1(elemWd) {
    if (elemWd.matches) {
      this.activePagingBtn(9);
    }
  }

  // JSQM - (min-width: 320px) and (max-width: 400px)
  checkMatchMedia_2(elemWd) {
    if (elemWd.matches) {
      this.activePagingBtn(7);
    }
  }

  // JSQM - (max-width: 320px)
  checkMatchMedia_3(elemWd) {
    if (elemWd.matches) {
      this.activePagingBtn(5);
    }
  }

  // Thêm thông báo bằng AleartifyJs
  triggerNotification(content, type, time = 4) {
    console.log(content)
    alertify.set('notifier','position', 'top-right');
    alertify.notify(content, type, time);
  }

  // Kích hoạt phân trang trên một query media phù hợp
  activePagingBtn(p_defaultPageNumbs) {
    this.defaultPageNumbs = p_defaultPageNumbs;
    // let objPagination = new Pagination(Math.ceil(this.grossProd / this.originalProdNumb), p_defaultPageNumbs);
    this.objPagination = new Pagination(Math.ceil(this.grossProd / this.originalProdNumb), p_defaultPageNumbs);
    this.objPagination.pagingInit();
  }

  runResPagination() {
    let wmM__minW400 = window.matchMedia("(min-width: 400px)");
    let wmM__minW320_maxW400 = window.matchMedia("(min-width: 320px) and (max-width: 400px)");
    let wmM__maxW320 = window.matchMedia("(max-width: 320px)");

    this.checkMatchMedia_1(wmM__minW400);
    this.checkMatchMedia_2(wmM__minW320_maxW400);
    this.checkMatchMedia_3(wmM__maxW320);

    wmM__minW400.addListener(this.checkMatchMedia_1.bind(this));
    wmM__minW320_maxW400.addListener(this.checkMatchMedia_2.bind(this));
    wmM__maxW320.addListener(this.checkMatchMedia_3.bind(this));

    $('.aic__input-page').attr('max', this.totalPages);
  }
}

var objID = new ID(Number($('.lun__item-totalIds').attr('data-totalIds')));
objID.runResPagination();
objID.triggerClickEvItemIds();
objID.triggerFocusoutEvInputPage();
objID.triggerClickEvCheckb();
objID.triggerClickEvUpdateBtn();
objID.triggerClickEvPagingBtns(objID.objPagination);