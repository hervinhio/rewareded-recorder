
                  <Field name="comments" label="Commentaires" defaultValue="">
                    {({ fieldProps, error }) => (
                      <Fragment>
                        <Textarea
                          autoComplete="off"
                          onPointerEnterCapture={() => undefined}
                          onPointerLeaveCapture={() => undefined}
                          {...fieldProps}
                          value={comment}
                          onKeyUp={(event) => {
                            if (event.key === 'Enter') {
                              event.stopPropagation();
                            }
                          }}
                          onChange={(e) => {
                            e.stopPropagation();
                            setComment((e as any).target.value);
                          }}
                        />
                        {error && (
                          <ErrorMessage>
                            Ce champ ne peut être vide.
                          </ErrorMessage>
                        )}
                      </Fragment>
                    )}
                  </Field>
              </div>
              </DialogContent>
              <ModalFooter>
                <ButtonGroup>
                  <LoadingButton
                    appearance="primary"
                    isLoading={isLoading}
                    onClick={submit}
                  >
                    {isEditMode ? 'Enregistrer' : 'Créer'}
                  </LoadingButton>
                  <Button
                    appearance="subtle"
                    onClick={() => props.onHide(false)}
                    isDisabled={isLoading}
                  >
                    Annuler
                  </Button>
                </ButtonGroup>
              </ModalFooter>
