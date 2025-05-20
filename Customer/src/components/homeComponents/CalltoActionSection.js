import React from "react";

const CalltoActionSection = () => {
  return (
    <div className="subscribe-section bg-with-black">
      <div className="container">
        <div className="row">
          <div className="col-xs-12">
            <div className="subscribe-head">
              <h2>Bạn có muốn nhận thông tin khuyến mãi?</h2>
              <p>Hãy tạo tài khoản để nhận thông tin khuyến mãi tốt nhất nhé</p>
              <form className="form-section">
                <input placeholder="Nhập email của bạn..." name="email" type="email" />
                <input value="Hãy gửi tôi nhé" name="subscribe" type="submit" />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalltoActionSection;
