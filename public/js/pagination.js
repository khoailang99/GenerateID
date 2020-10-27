﻿// Phân trang
export default class Pagination {
	constructor(totalPages, defaultPageNumbs) {
		this.totalPages = totalPages;
		this.defaultPageNumbs = defaultPageNumbs;
		this.numbPages = this.totalPages > this.defaultPageNumbs ? this.defaultPageNumbs : this.totalPages;
		this.breakPSTS = Math.ceil(this.numbPages / 2) - 2; // Điểm ngắt sử dụng trong biểu thức để xác định khi nào hiển thị 2 phân cách (2 dấu breakPSTS chấm) trên phân trang.
	}

	pagingInit() {
		this.refreshUlToDefault();
		let strPagingBtnHTML = "";
		let txtPagingBtn = 0;
		for (let i = 1; i <= this.numbPages; i++) {
			txtPagingBtn = (i == this.numbPages) ? this.totalPages : ((i == this.numbPages - 1 && this.totalPages > this.numbPages) ? "..." : i);
			strPagingBtnHTML += `<li><button type="button" class="disable-btn-default-bootstrap btn btn-link padding-tb-lf-5-20 lpn__pagin-btn ${i == 1 ? "active" : ""}" data-page="${isNaN(txtPagingBtn) ? 0 : txtPagingBtn}"> ${txtPagingBtn}</button></li>`;
		}
		$(strPagingBtnHTML).insertAfter('.pa__list-page-numbers .left-arow');
		this.updatePagingBtnPrevNext(Number($("button.active").attr('data-page')))
	}

	handlePagin(page) {
		let txtPagingBtn = 0, count = 0;
		let pagingBtns = document.querySelectorAll(".lpn__pagin-btn");
		let middleIndex = Math.ceil(this.numbPages / 2);
		if ((page - 1) <= this.breakPSTS) {
			pagingBtns.forEach((elem) => {
				txtPagingBtn = (++count == this.numbPages - 1) ? "..." : ((count == this.numbPages) ? this.totalPages : count);
				this.updatePagingBtn(elem, page, txtPagingBtn);
			});
		} else if ((this.totalPages - page) <= this.breakPSTS) {
			let lastPages = this.totalPages + 3 - this.numbPages;
			pagingBtns.forEach((elem) => {
				txtPagingBtn = (++count == 2) ? "..." : ((count == 1) ? 1 : lastPages++);
				this.updatePagingBtn(elem, page, txtPagingBtn);
			});
		} else {
			pagingBtns.forEach((elem) => {
				txtPagingBtn = (++count == 1 || count == this.numbPages) ? ((count == 1) ? 1 : this.totalPages) : ((Math.abs(middleIndex - count) > this.breakPSTS - 1) ? "..." : page - (middleIndex - count));
				this.updatePagingBtn(elem, page, txtPagingBtn);
			});
		}
		this.updatePagingBtnPrevNext(page);
	}

	updatePagingBtnPrevNext(page) {
		document.querySelector(".lf__prev-page").setAttribute('data-page', page - 1);
		document.querySelector(".rr__next-page").setAttribute('data-page', page + 1);
	}

	updatePagingBtn(elemBtn, page, txtPagingBtn) {
		elemBtn.innerHTML = txtPagingBtn;
		elemBtn.setAttribute('data-page', isNaN(txtPagingBtn) ? 0 : txtPagingBtn);
		if (page == txtPagingBtn) {
			elemBtn.classList.add("active");
		}
	}

	updateStatusValuePagingBtns(valTargetBtn, prevPage) {
		// if (valTargetBtn == 0 || valTargetBtn > this.totalPages || valTargetBtn < 1 || prevPage == valTargetBtn) { return false; }
		document.querySelector("button.active").classList.remove("active");
		if (this.totalPages > this.numbPages) {
			this.handlePagin(valTargetBtn);
		} else {
			this.updatePagingBtnPrevNext((valTargetBtn - prevPage == 1)?valTargetBtn:valTargetBtn-1);
			document.querySelectorAll(".lpn__pagin-btn").forEach((elem, index) => {
				this.updatePagingBtn(elem, valTargetBtn, index + 1);
			});
		}
		// return true;
  }

	refreshUlToDefault() {
		let ulContainPagingBtn = document.querySelector('.pa__list-page-numbers');
		let allChildUl = document.querySelectorAll('.pa__list-page-numbers li');
		let numbChildrenUl = ulContainPagingBtn.childElementCount;
		if (numbChildrenUl > 2) {
			ulContainPagingBtn.innerHTML = allChildUl[0].outerHTML + allChildUl[numbChildrenUl - 1].outerHTML;
		}
	}
}