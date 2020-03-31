/* eslint-disable react/static-property-placement */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import api from '../../services/api';
import {
  Loading,
  Owner,
  IssueList,
  MoveButton,
  ContainerButtons,
} from './styles';
import Container from '../../components/Container';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: null,
    issues: [],
    loading: true,
    loadingOthers: false,
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`repos/${repoName}/issues`),
      {
        params: {
          state: 'open',
          per_page: 5,
        },
      },
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  getIssues = async (page) => {
    const { repository } = this.state;
    const response = await api.get(
      `repos/${repository.full_name}/issues?page=${page}`
    );
    return response;
  };

  moreIssues = async () => {
    this.setState({ loadingOthers: true });
    let { page } = this.state;
    page += 1;
    const response = await this.getIssues(page);
    this.setState({ issues: response.data, page, loadingOthers: false });
  };

  lessIssues = async () => {
    this.setState({ loadingOthers: true });
    let { page } = this.state;
    if (page !== 1) {
      page -= 1;
      const response = await this.getIssues(page);
      this.setState({ issues: response.data, page, loadingOthers: false });
    }
    this.setState({ loadingOthers: false });
  };

  render() {
    const { repository, issues, loading, loadingOthers, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          {repository ? (
            <>
              <img
                src={repository.owner.avatar_url}
                alt={repository.owner.login}
              />
              <h1>{repository.name}</h1>
              <p>{repository.description}</p>
            </>
          ) : null}
        </Owner>

        <IssueList>
          {issues.length > 0
            ? issues.map((issue) => (
                <li key={String(issue.id)}>
                  <img src={issue.user.avatar_url} alt={issue.user.login} />
                  <div>
                    <strong>
                      <a href={issue.html_url}>{issue.title}</a>
                      {issue.labels.map((label) => (
                        <span key={String(label.id)}>{label.name}</span>
                      ))}
                    </strong>
                    <p>{issue.user.login}</p>
                  </div>
                </li>
              ))
            : 'Este repositório não possui Issues ou esta informação está indisponível no momento.'}
        </IssueList>

        <ContainerButtons>
          {page > 1 ? (
            <MoveButton loadingOthers={loadingOthers} onClick={this.lessIssues}>
              Anterior
            </MoveButton>
          ) : null}
          <MoveButton loadingOthers={loadingOthers} onClick={this.moreIssues}>
            Próximo
          </MoveButton>
        </ContainerButtons>
      </Container>
    );
  }
}
