import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import {urlConfig} from '../../config';
import './SearchPage.css'

function SearchPage() {

    // Define state variables for the search query, age range, and search results.
    const [name, setName]= useState('');
    const [ageRange, setagerange]= useState(6);
    const [category, setCategory]= useState('');
    const [condition, setCondition]= useState('');
    const [results, setSearchResults]= useState([]);
    const [buttondisabled, setbuttondisabled]= useState(true)

    const categories = ['Living', 'Bedroom', 'Bathroom', 'Kitchen', 'Office'];
    const conditions = ['New', 'Like New', 'Older'];

    useEffect(() => {
        // fetch all products
        const fetchProducts = async () => {
            try {
                let url = `${urlConfig.backendUrl}/api/gifts`
                console.log(url)
                const response = await fetch(url);
                if (!response.ok) {
                    //something went wrong
                    throw new Error(`HTTP error; ${response.status}`)
                }
                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.log('Fetch error: ' + error.message);
            }
        };

        fetchProducts();
    }, []);


    // Fetch search results from the API based on user inputs.
    const handleSearch = async ()=>{
        const queryParams = new URLSearchParams({
            name: name, category: category, condition: condition, age_year: ageRange,
        }).toString();
        const response = await fetch(`${urlConfig.backendUrl}/api/search?${queryParams}`);
        const data = await response.json();
        setSearchResults(data);
    }

    const navigate = useNavigate();

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' });
      };
      const getConditionClass = (condition) => {
        return condition === "New" ? "list-group-item-success" : "list-group-item-warning";
    };

    const goToDetailsPage = (productId) => {
        // Enable navigation to the details page of a selected gift.
        navigate(`/app/product/${productId}`)
    };

 const enablebutton = useCallback (()=>{
    if(name !== '' || category !== '' || condition !== ''){
        setbuttondisabled(false);
    }else{
        setbuttondisabled(true);
    }
}, [name, category, condition]);

useEffect(()=>{
    enablebutton()
}, [name, category, condition, enablebutton])
    return (
        <>
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="filter-section mb-3 p-3 border rounded">
                        <h5>Filters</h5>
                        <div className="d-flex flex-column">
                            {/* Dynamically generate category and condition dropdown options.*/}
                            <label htmlFor="categorySelect">Category</label>
                            <select id="categorySelect" className="form-control my-1" onChange={e=> setCategory(e.target.value)}>
                                <option value="">All</option>
                                {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                            
                            <label htmlFor="categorySelect">Condition</label>
                            <select id="conditionSelect" className="form-control my-1" onChange={e=> setCondition(e.target.value)}>
                                <option value="">All</option>
                                {conditions.map(condition => (
                                <option key={condition} value={condition} >{condition}</option>
                                ))}
                            </select>
                            {/*Implement an age range slider and display the selected value. */}
                            <label htmlFor="ageRange">Less than {ageRange} years</label>
                            <input
                                type="range"
                                className="age-range-slider"
                                id="ageRange"
                                min="1"
                                max="10"
                                value={ageRange}
                                onChange={e => setagerange(e.target.value)}
                           />
                        </div>
                    </div>
                    {/*Add text input field for search criteria*/}
                    <input
                          className='search-input'
                          type="text"
                          placeholder='Search for item by its name...'
                          value={name}
                          onChange={e=> setName(e.target.value)}
                    /><br/>
                    <button className='search-button' onClick={handleSearch} disabled={buttondisabled}>Search</button>
                    </div>
                    {/*Display search results and handle empty results with a message. */}
                    <div className="row">
                       {results.length > 0 ? (
                       results.map((gift) => (
                    <div key={gift.id} className="col-md-4 mb-4">
                        <div className="card product-card">
                            <div className="image-placeholder">
                                {gift.image ? (
                                    <img src={gift.image} alt={gift.name} className="card-img-top" />
                                ) : (
                                    <div className="no-image-available">No Image Available</div>
                                )}
                            </div>

                            <div className="card-">
                                <h5 className="card-title">{gift.name}</h5>
                                <p className='description'>{gift.description}</p>
                                <p className={`card-text ${getConditionClass(gift.condition)}`}>
                                {gift.condition}
                                </p>
                                <p className="card-text">{formatDate(gift.date_added)}</p>
                                <button onClick={() => goToDetailsPage(gift.id)} className="btn btn-primary">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))
                ):(
                    <div className="alert alert-info" role="alert">
                     No products found. Please revise your filters.
                    </div>
                )}
            </div>
                </div>
            </div>
        </>
    );
}

export default SearchPage;
