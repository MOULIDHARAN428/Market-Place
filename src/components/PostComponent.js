import React, {useState} from 'react'
import {ethers} from 'ethers'
import Marketplace from '../abis/Marketplace.json';
import '../App.css';
import * as web3_utils from 'web3-utils';
const Web3 = require('web3');
// const web3 = new Web3();

const Post = () => {
	const [errorMessage, setErrorMessage] = useState(null);
    const [defaultAccount, setDefaultAccount] = useState(null);
    const [userBalance, setUserBalance] = useState(null);
    const [connButtonText, setConnButtonText] = useState('Connect Wallet');
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [marketplace, setMarketplace] = useState();
    const [products, setProducts] = useState([]);
    var provider = typeof window !== "undefined" && window.ethereum;

    const connectWalletHandler = () => {
        if (window.ethereum && window.ethereum.isMetaMask) {
            console.log('MetaMask Here!');

            window.ethereum.request({ method: 'eth_requestAccounts'})
            .then(result => {
                accountChangedHandler(result[0]);
                setConnButtonText('Wallet Connected');
                setMarketplace(new Web3(provider).eth.Contract(Marketplace.abi));
                console.log(marketplace);
            })
            .catch(error => {
                setErrorMessage(error.message);
            });
        } else {
            console.log('Need to install MetaMask');
            setErrorMessage('Please install MetaMask browser extension to interact');
        }
    }
    // update account, will cause component re-render
    const accountChangedHandler = (newAccount) => {
        setDefaultAccount(newAccount);
        getAccountBalance(newAccount.toString());
    }
    const getAccountBalance = (account) => {
        window.ethereum.request({method: 'eth_getBalance', params: [account, 'latest']})
        .then(balance => {
            setUserBalance(ethers.utils.formatEther(balance));
        })
        .catch(error => {
            setErrorMessage(error.message);
        });
    };
    const chainChangedHandler = () => {
        // reload the page to avoid any errors with chain change mid use of application
        window.location.reload();
    }
    const setContractAddress = async () => {
        const networkID = await new Web3(provider).eth.net.getId();
        if(Marketplace.networks[networkID]){
            setMarketplace(new Web3(provider).eth.Contract(Marketplace.abi));
            marketplace.address = Marketplace.networks[networkID].address;
        } else {
            setErrorMessage('Marketplace contract not deployed to this network');
        }
    }
    // listen for account changes
    window.ethereum.on('accountsChanged', accountChangedHandler);
    window.ethereum.on('chainChanged', chainChangedHandler);

    const displayProducts = async () => {
        if(defaultAccount){
            await setContractAddress();
            const count = await marketplace.methods.productCount().call();
            console.log("Product count : "+count.toNumber());
            for(var i=1; i<=count; i++){
                const product =await  marketplace.methods.products(i).call();
                setProducts (products=>[...products,product]);
                
            }
        }
        else{
            alert('Please connect to wallet');
        }
    }

    const createProduct = async (name,price) =>{
        await setContractAddress();
        marketplace.methods.createProduct(name, price).send({from: defaultAccount})
        .once('receipt', (receipt) => {
            console.log(receipt);
        });
    }
    
    const purchaseProduct = async (id,price) => {
        await setContractAddress();
        marketplace.methods.purchaseProduct(id).send({from: defaultAccount, value: price})
        .once('receipt', (receipt) => {
            console.log(receipt);
        });
    }

    return (
        <>
            <div className='walletCard'>
                <h4> {"Connection to MetaMask using window.ethereum methods"} </h4>
                <button onClick={connectWalletHandler}>{connButtonText}</button>
                <button onClick={displayProducts}>showProduct</button>
                <div className='accountDisplay'>
                    <h3>Address: {defaultAccount}</h3>
                </div>
                <div className='balanceDisplay'>
                    <h3>Balance: {userBalance}</h3>
                </div>
                {errorMessage}
            </div>

            <div>
                {defaultAccount === null ? <div>{' '}Connect your account</div> :
                <div id="main">
                    <h1>Add Product</h1>
                    <form onSubmit={(event) => {
                        event.preventDefault();
                        var name = productName.value;
                        // var price = window.web3.utils.toWei(productPrice.value.toString(), 'ether');
                        var price = web3_utils.toWei(productPrice.value.toString(), 'ether');
                        // console.log(price);
                        createProduct(name,price)}
                    }>
                    <div className="form-group mr-sm-2">
                        <input
                        id="productName"
                        type="text"
                        ref={(input) => { setProductName(input) }}
                        className="form-control"
                        placeholder="Product Name"
                        required />
                    </div>
                    <div className="form-group mr-sm-2">
                        <input
                        id="productPrice"
                        type="text"
                        ref={(input) => { setProductPrice(input) }}
                        className="form-control"
                        placeholder="Product Price"
                        required />
                    </div>
                    <button type="submit" className="btn btn-primary">Add Product</button>
                    </form>
                    <p>&nbsp;</p>
                    <h2>Buy Product</h2>
                    <table className="table">
                    <thead>
                        <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Price</th>
                        <th scope="col">Owner</th>
                        <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody id="productList">
                        { products.map((product,key) => {
                        const owner = product.owner.toLowerCase();
                        return(
                            <tr key={key}>
                            <th scope="row">{product.id.toString()}</th>
                            <td>{product.name}</td>
                            <td>{web3_utils.fromWei(product.price.toString(), 'ether')} Eth</td>
                            <td>{product.owner}</td>
                            <td>
                                { (!product.purchased && owner !== defaultAccount)  
                                ? <button
                                    name={product.id}
                                    value={product.price}
                                    onClick={(event) => {
                                        purchaseProduct(event.target.name, event.target.value)
                                    }}
                                    >
                                    Buy
                                    </button>
                                : null
                                }
                                </td>
                            </tr>
                        )
                        
                        })}
                    </tbody>
                    </table>
                </div>
                }
            </div>
        </>
    );
}

export default Post;

