import { Link } from "react-router-dom";
import Applemail from "../AppleMail/AppleMail";
import Finder from "../Filemanager/react";
import AppleAppStore from "../Applestore/AppleAppStore";
import "./Landing.css";
import { useState } from "react";

function LandingPage() {
  const [applemail, setapplemail] = useState(false);
  const [finder, setfinder] = useState(false);
  const [appleapstore, setappleappstore] = useState(false)

  function Applemailing() {
    setapplemail(true);
  }
  function Applemailkill() {
    setapplemail(false);
  }
  function finderSet() {
    setfinder(true);
  }
  function finderUnSet() {
    setfinder(false);
  }
  function Appstore(){
    setappleappstore(true)
  }
  function ResetAppstore(){
    setappleappstore(false)
  }

  function Mailapple(props) {
    setapplemail(props.condition);
  }

  function Maclogo(props) {
    return (
      <div className="logo-container">
        <div className="icon-div">
          <img src={props.img} alt="icon" />
        </div>
      </div>
    );
  }

  function MainIcons(props) {
    return (
      <>
        <div className="iphone-icon-container">
          <div className="icon-div">
            <img src={props.img} alt="icon" />
          </div>
        </div>
      </>
    );
  }

  function Icons(props) {
    return (
      <>
        <div className="iphone-icon-container">
          <div className="icon-div">
            <img src={props.img} alt="icon" />
          </div>
          <h5>{props.appname}</h5>
        </div>
      </>
    );
  }

  function CardsIcon() {
    return (
      <div className="icon-container">
        <Icons img="src/assets/settings_icon.jpg" appname="settings" />
        <Icons img="src/assets/browser_icon.jpg" appname="newtab" />
        <Icons img="src/assets/images.png" appname="linkdin" />
        <Icons img="src/assets/news_icon.jpg" appname="news" />
        <span>
          <Link to={"/message"}>
            <Icons img="src/assets/message.jpg" appname="massages" />
          </Link>
        </span>
        <button onClick={Appstore}>
          <Icons img="src/assets/appstore_icon.jpg" appname="PROJECTS" />
        </button>
        <Icons img="src/assets/images (2).jpeg" appname="instagram" />
        <Icons img="src/assets/images (1).png" appname="facebook" />
      </div>
    );
  }

  function Searchbar() {
    return (
      <div className="search-icon">
        <p>search</p>
      </div>
    );
  }

  function MainCards() {
    return (
      <main>
        <div className="main-home-icons">
          <button onClick={finderSet}>
            <Maclogo img="src/assets/macos_logo.webp" />
          </button>
          
          <Maclogo img="src/assets/settings_icon.jpg" />

          <MainIcons img="src/assets/browser_icon.jpg" />

          <button onClick={Applemailing}>
            <Maclogo img="src/assets/message_icon.jpg" />
          </button>

          <button>
            <Maclogo img="src/assets/file_icon.webp" />
          </button>
          
          <span>
            <MainIcons img="src/assets/about_icon.jpg" />
          </span>

          <MainIcons img="src/assets/Image_icon.jpg" />

          <button>
            <div className="trash-icon">
              <Maclogo img="src/assets/trash_4.png" />
            </div>
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <section id="landing_page" className="Landing-page">
        <div className="allcontainer-cards">
          <CardsIcon />
          <Searchbar />
          <MainCards />
        </div>
        {applemail && <Applemail func={Applemailkill} />}
        {finder && <Finder func={finderUnSet} />}
        {appleapstore && <AppleAppStore func={ResetAppstore} />}
      </section>
    </>
  );
}

export default LandingPage;
