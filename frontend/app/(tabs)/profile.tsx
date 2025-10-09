import React from 'react';


//here is me playing around with shit that I don't understand



function EditButton() {
    return (
        <button>
        //image:pencil
            Edit
        </button>
    );
}

//overall profile page
export default function profile() {
    return (
        //header
        <div>
            <h1>firstname lastname</h1>
            <img className="profile"/> 
            <h2>@user.username</h2>
            <p> user.bio</p>
            <EditButton />
        </div>
        //book sections
        <div>
        </div>
     
    );
}
function BookSection({ title, books }) {
    return (
        <div>
            <h1>
            title
            </h1>
            //implement scrollable menu like https://www.w3schools.com/howto/howto_css_menu_horizontal_scroll.asp in CSS
            <p>
                book1
                book2
                book3
            </p>

        </div>
    );
}




//vidya's header and search bar
//profile photo left aligned
//big text fitstname last name
//smaller text @username
//normal small text bio
//divider
//top three centered heading
//three books
//currently reading centered heading
//iew all currently reading
//divider
//past reacds centered heading
//scroll left right past reads
//divider
//saved for later centered heading
//scroll left right saved for later
//divider
//your LitClubs
//footer with the default buttons on it
