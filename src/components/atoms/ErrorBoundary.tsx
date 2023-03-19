import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.log(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <div>Unexpected error occured. Email ppciesiolkiewicz@gmail.com</div>
    }

    return this.props.children;
  }
}

export default ErrorBoundary;