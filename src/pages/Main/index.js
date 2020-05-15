import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';
import Container from '../../components/Container';
import { Form, SubmitButton, List, Error } from './styles';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: false,
    newRepoDuplicated: false,
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');
    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = (e) => {
    this.setState({ newRepo: e.target.value });
  };

  repoIsDuplicated = (repo) => {
    const { repositories } = this.state;
    return repositories.some((repository) => repository.name === repo);
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    try {
      this.setState({ loading: true });
      const { newRepo, repositories } = this.state;
      if (repositories.some((repository) => repository.name === newRepo)) {
        this.setState({ newRepoDuplicated: true });
      } else {
        const responseRepositories = await api.get(`repos/${newRepo}`);
        const data = {
          name: responseRepositories.data.full_name,
        };

        this.setState({
          repositories: [...repositories, data],
          error: false,
        });
      }
    } catch (err) {
      this.setState({
        error: true,
        newRepoDuplicated: false,
      });
    } finally {
      this.setState({
        newRepo: '',
        loading: false,
      });
    }
  };

  render() {
    const {
      loading,
      repositories,
      newRepo,
      error,
      newRepoDuplicated,
    } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>
        <Form onSubmit={this.handleSubmit} error={error || newRepoDuplicated}>
          <input
            value={newRepo}
            placeholder="Adicionar repositório"
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>

        {newRepoDuplicated && <Error>Repositório duplicado.</Error>}
        {error && <Error>Repositório não encontrado.</Error>}

        <List>
          {repositories.map((repository) => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
