import React from "react";
import "./appleappstore.css"

function Category(prop){

    function CategoryCard(prop){
        return(
            <div className="category-card">
                <i className={prop.icon}></i>
                <span>{prop.category}</span>
            </div>
        )
    }

    return(
        <div className="c-container">
            <div className="category--container">
                <div className="category-title">
                    <h1>Browse by category</h1>
                </div>
                <div className="card-contaier">

                    <button onClick={prop.productive}>
                        <CategoryCard
                            icon="fas fa-check-circle"
                            category="Productivity"
                        />
                    </button>
                    
                    <button onClick={prop.community}>
                        <CategoryCard
                            icon="fas fa-users"
                            category="Community"
                        />
                    </button>
                    
                    <button onClick={prop.entertainment}>
                        <CategoryCard
                            icon="fas fa-headphones"
                            category="Entertainment"
                        />
                    </button>
                    
                    <button onClick={prop.portfolio}>
                        <CategoryCard
                            icon="fas fa-user"
                            category="Portfolios"
                        />
                    </button>
                    
                </div>
            </div>
        </div>
    )
}

export default Category