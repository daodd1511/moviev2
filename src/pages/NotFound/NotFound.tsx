/* eslint-disable react/no-unescaped-entities */
import './NotFound.css';

export const NotFound = () => (
  <main>
    <section className="page_404">
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <div className="col-sm-10 col-sm-offset-1 text-center">
              <h1 className="text-center title">404</h1>
              <div className="four_zero_four_bg"></div>
              <div className="contant_box_404">
                <h3 className="h2">Look like you're lost</h3>
                <p>the page you are looking for not avaible!</p>
                <a href="/" className="link_404">Go to Home</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
);
