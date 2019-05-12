import React from 'react';

class Draggable extends React.Component {
  dragElementIndex = null;
  dropElementIndex = null;
  longPressed = false;
  touchX = null; //first touched on the child to move card based on this
  touchY = null;
  previousY = null; // while dragging to know if it is going up/down
  maxHeightDraggable = 0; //not to scroll when reach to the max height

  componentDidUpdate() {
    if (this.refs.draggable.children.length) {
      const lastChild = this.refs.draggable.children[this.refs.draggable.children.length - 1];
      // cannot scroll more than bottom of last child
      this.maxHeightDraggable = lastChild.getBoundingClientRect().bottom;
    }
  }

  handleTouchStart = e => {
    const y = e.touches[0].clientY;
    const x = e.touches[0].clientX;
    this.dragElementIndex = Array.from(this.refs.draggable.children).findIndex((child) => {
      const boundary = child.getBoundingClientRect();
      return (
        y > boundary.top && y < boundary.bottom &&
        x > boundary.left && x < boundary.right);
    });
    const dragElement = this.refs.draggable.children[this.dragElementIndex];
    e.persist();
    if (dragElement) {
      dragElement.ontouchmove = () => {
        // to disable scroll while dragging
        // touch move is passive event we can't directly cancel passive event 
        // hence we need to check if it is cancelable then cancel the event
        // if you touch and move and scroll start then cancelable will be false
        if (e.cancelable) return false;
        return true;
      };
    }
    if (this.touchX == null || this.touchY == null) {
      // store the first touch on child
      this.touchY = e.touches[0].clientY + this.refs.draggable.scrollTop;
      this.touchX = e.touches[0].clientX + this.refs.draggable.scrollLeft;
    }
    this.longPressed = false;
    this.pressTimer = window.setTimeout(() => {
      this.handleLongPress();
    }, 300);
  }

  handleLongPress = () => {
    const element = this.refs.draggable.children[this.dragElementIndex];
    if (element) {
      element.style.boxShadow = '#dedede 6px 7px 20px';
      element.style.border = 'solid 1px #a8a6a6';
      // element is long pressed now we can drag and cancel touch move if cancelable
      element.ontouchmove = (e) => {
        if (e.cancelable) {
          this.longPressed = true;
          return false;
        }
        // if not cancelable change the css to initial
        element.style.boxShadow = '';
        element.style.border = ''
        return true;
      };
    }
  }

  handleTouchMove = e => {
    if (this.longPressed) {
      const y = e.touches[0].clientY;
      const x = e.touches[0].clientX;
      const boundaries = [];
      // tempDropIndex is index of child which crossed by drag item 
      const tempDropIndex = Array.from(this.refs.draggable.children).findIndex((child, i) => {
        const boundary = child.getBoundingClientRect();
        boundaries.push(boundary);
        return (i !== this.dragElementIndex &&
          y > boundary.top && y < boundary.bottom &&
          x > boundary.left && x < boundary.right);
      });
      const dropElement = this.refs.draggable.children[tempDropIndex];
      const isDraggingUp = this.previousY > y;
      this.previousY = y;
      if (dropElement) {
        let transY = dropElement.offsetHeight + parseInt(dropElement.style.marginBottom || 0);
        this.dropElementIndex = tempDropIndex; //actual drop element index
        if (!isDraggingUp) {
          // dragging a element to top
          transY = -transY;
        }
        if (!dropElement.style.transform) {
          // if element is not changed its position which means we can translate position
          // else translate to its previous location means 

          dropElement.style.transform = `translate(0, ${transY}px)`;
        }
        else {
          dropElement.style.transform = '';
          if (isDraggingUp) this.dropElementIndex--;
          else this.dropElementIndex++;
        }
      }

      // scroll screen when drag element goes beyond the screen
      let scrollHeight = 0;
      if (boundaries[this.dragElementIndex] &&
        boundaries[this.dragElementIndex].bottom > this.refs.draggable.clientHeight &&
        boundaries[this.dragElementIndex].bottom + this.refs.draggable.scrollTop < this.maxHeightDraggable) {
        scrollHeight = 50;
      }
      if (boundaries[this.dragElementIndex] &&
        boundaries[this.dragElementIndex].top < this.refs.draggable.offsetTop) {
        scrollHeight = -50;
      }
      const dragElement = this.refs.draggable.children[this.dragElementIndex];
      this.refs.draggable.scrollTop = this.refs.draggable.scrollTop + scrollHeight;
      dragElement.style.transform =
        `translate(0, ${y - this.touchY + this.refs.draggable.scrollTop}px)`;
    }
    else {
      clearTimeout(this.pressTimer);
      const dragElement = this.refs.draggable.children[this.dragElementIndex];
      if (dragElement) {
        dragElement.ontouchmove = null;
      }
    }
  }
  handleTouchEnd = e => {
    const dragElement = this.refs.draggable.children[this.dragElementIndex];
    if (dragElement) {
      dragElement.style.boxShadow = '';
      dragElement.style.border = '';
      dragElement.style.transform = '';
      // to enable scroll feature we set ontouchmove null
      dragElement.ontouchmove = null;
    }
    this.touchX = this.touchY = null;
    if (this.longPressed) {
      Array.from(this.refs.draggable.children).forEach((child, i) => {
        child.style.transform = '';
      });
      if (this.dragElementIndex === undefined ||
        this.dropElementIndex === undefined ||
        this.dragElementIndex < 0 ||
        this.dropElementIndex < 0 ||
        this.dragElementIndex === this.dropElementIndex) return;
      this.props.updateChildren(this.dragElementIndex, this.dropElementIndex);
      this.longPressed = false;
    }
    else {
      clearTimeout(this.pressTimer);
    }
  }

  handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  handleDragEnd = (e) => {
    const dragElement = e.target;
    dragElement.style.background = '';
    dragElement.style.boxShadow = '';
    dragElement.style.border = '';
    dragElement.style.transform = '';
  }

  handleDragStart = (e) => {
    this.touchY = e.clientY
    const img  = document.createElement('img');
    img.style.display = 'none';
    e.dataTransfer.setDragImage(img, 0, 0);
    
  }

  handleDrag = (e) => {
    
  }

  handleDragOver = (e) => {
    // const dropElement = e.target;
    // console.log(dropElement.innerText)
    // let transY = dropElement.offsetHeight + parseInt(dropElement.style.marginBottom || 0);
    // if (!dropElement.style.transform) {
    //   // if element is not changed its position which means we can translate position
    //   // else translate to its previous location means 

    //   dropElement.style.transform = `translate(0, ${transY}px)`;
    // }
  }
  handleDrop = (e) => {
    console.log(e)
  }
  handleDropCapture = (e) => {
    console.log(e)
  }
  render() {
    const children = React.Children.map(this.props.children,
      child => React.cloneElement(child, {
        onTouchStart: this.handleTouchStart,
        onTouchMove: this.handleTouchMove,
        onTouchEnd: this.handleTouchEnd,
        onContextMenu: this.handleContextMenu,
        onDrag: this.handleDrag,
        onDragStart: this.handleDragStart,
        onDragEnd: this.handleDragEnd,
        onDragOver: this.handleDragOver,
        onDrop: this.handleDrop,
        onDropCapture: this.handleDropCapture
      }));
    return (
      <div
        style={{ ...this.props.style, overflow: 'scroll', maxWidth: '100vw', scrollBehavoiur: 'smooth' }}
        ref="draggable">
        {children}
      </div>
    );
  }
}

export default Draggable;