import React from 'react';
import logo from './logo.svg';
import './App.css';
import { tsPropertySignature } from '@babel/types';

function App() {
  return (
    <Contacts contacts={[{name: 'Hola', phone: '12345'}, {name: 'Adios', phone: '54321'}]} />
  );
}

function Contact(props) {
  return <tr><td>{props.c.name}</td><td>{props.c.phone}</td><td><button className="btn btn-primary" onClick={() => props.onEdit(props.c)}>Edit</button></td></tr>;
}

class NewContact extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      phone: ''
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  render() {
  return <tr>
      <td><input name="name" type="text" value={this.state.name} onChange={this.handleChange}></input></td>
      <td><input name="phone" type="text" value={this.state.phone} onChange={this.handleChange}></input></td>
      <td><button className="btn btn-primary" onClick={() => this.props.onAddContact({name: this.state.name, phone: this.state.phone})}>Add contact</button></td>
    </tr>
  }
}

class Contacts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedContact: null,
      contacts: []
    };
    this.handleEdit = this.handleEdit.bind(this);
    this.handleCloseError = this.handleCloseError.bind(this);
    this.handleAddContact = this.handleAddContact.bind(this);
  }

  handleEdit(contact) {
    this.setState({
      selectedContact: contact.name
    });
  }

  handleCloseError() {
    this.setState({
      selectedContact: null
    });
  }

  handleAddContact(contact) {
    if (this.state.contacts.find(c => c.name === contact.name)) {
      this.setState({
        selectedContact: 'Contact with name ' + contact.name + ' already exists'
      });
    } else {
      ContactApi.postContact(contact).then((response) => {
        this.setState({
          selectedContact: null,
          contacts:response
        });
      });
    }
  }

  componentDidMount() {
    ContactApi.getAllContacts().then((response) => {
        this.setState({
          contacts: response
        });
      }
    )
  }

  render() {
    const listContacts = this.state.contacts.map(contact => <Contact c={contact} onEdit={this.handleEdit} />)
    return <div>
      <Alert message={this.state.selectedContact} onClose={this.handleCloseError} />
      <table className="table">
        <thead>
          <tr>
            <th>Name</th><th>Phone</th><th>&nbsp;</th>
          </tr>
          {listContacts}
          <NewContact onAddContact={this.handleAddContact} />
        </thead>
      </table>
    </div>
  }
}

function Alert({message, onClose}) {
  if (!message) return null;
  return <div className="alert alert-warning alert-dismissible fade show" role="alert">
    {message}
    <button type="button" className="close" onClick={() => onClose()}>
      <span aria-hidden="true">&times;</span>
    </button>
  </div>;
}

class ContactApi {
  static requestHeaders() {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
  }

  static getAllContacts() {
    const headers = this.requestHeaders();
    const request = new Request('http://localhost:8080/contacts', {
      method: 'GET',
      headers: headers
    });
    return fetch(request).then(response => {
      return response.json();
    });
  }

  static postContact(contact) {
    const headers = this.requestHeaders();
    const request = new Request('http://localhost:8080/contacts', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(contact)
    });
    return fetch(request).then(() => {
      return this.getAllContacts().then(response => {
        return response;
      });
    });
  }
}

export default App;
