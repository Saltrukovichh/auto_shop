import React, { Component } from 'react'

export class Item extends Component {
  render() {
    return (
      <div className='item'> 
            <img src={"./img/" + this.props.item.img}></img>
            <h2>{this.props.item.title}</h2>
      </div>
    )
  }
}

export default Item