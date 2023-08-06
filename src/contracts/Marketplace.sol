pragma solidity ^0.5.0;

contract Marketplace {
    string public name;

    constructor() public {
        name = "Bharath";
    }

    struct Product {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    mapping(uint => Product) public products;
    uint public productCount = 0;

    event ProductCreated(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    function createProduct(string memory _name, uint _price) public {
        // Req a valid name
        require(bytes(_name).length > 0);
        // Req a valid price
        require(_price > 0);
        // Increment
        productCount++;
        // Create product
        products[productCount] = Product(productCount, _name, _price, msg.sender, false);
        // Trigger an event: Emit
        emit ProductCreated(productCount, _name, _price, msg.sender, false);
    }

    event ProductPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    function purchaseProduct(uint _id) public payable {
        // Fetch product
        Product memory _product = products[_id];
        // Fetch owner
        address payable _seller = _product.owner;
        // Make sure the product has valid id
        require(_product.id > 0 && _product.id < productCount);
        // Check there is a enough ether in transactions
        require(msg.value >= _product.price);
        // Check product has not been purchased already
        require(!_product.purchased);
        // Check buyer is not seller
        require(_seller != msg.sender);
        // Transfer owenership to the buyer
        _product.owner = msg.sender;
        // Mark as purchased
        _product.purchased = true;
        // Update product
        products[_id] = _product;
        // Pay seller by sending them Ether
        address(_seller).transfer(msg.value);
        // Trigger an event
        emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true);
    }
}
