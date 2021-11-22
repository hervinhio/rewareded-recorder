import { Alert } from "react-bootstrap";

export interface FormProps {
  url: string;
}

export function Form(props: FormProps) {

  if (!props.url) {
    return (
      <Alert key={0} variant={'warning'} className="mt-2 col-lg-6 offset-lg-3 col-xs-12">
        <Alert.Heading>Un peutit souci! Rien de grave.</Alert.Heading>
        Aucun mois n'a été séléctionné ou il n'existe aucun formulaire pour le mois selectionné
        <hr />
        <p className="mb-0">
          Lorsqu'il existe un formulaire pour un mois sélectionné, le formulaire s'affiche normalement.
        </p>
      </Alert>
    )
  }

  return (
    <div className="row">
      <iframe
        src={props.url}
        height="1249"
        frameBorder={0}
        marginHeight={0}
        marginWidth={0}
        className="mt-2 col-lg-6 offset-lg-3 col-xs-12"
      >
        Chargement...
      </iframe>
    </div>
  );
}
