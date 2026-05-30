<?php
require_once __DIR__ . '/../models/Lista.php';
require_once __DIR__ . '/../models/ListaItem.php';
class ListaController{

    private $listaModel;
    private $listaItemModel;

    public function __construct(){
        $this->listaModel = new Lista();
        $this->listaItemModel = new ListaItem();
    }

    public function crearLista(int $usuario_id, string $nombre, string $tipo_lista){
        if(empty($nombre)){
            throw new Exception("El nombre de la lista no puede estar vacío");
        }
        if($nombre === 'Viendo' || $nombre === 'Completado' || $nombre === 'Pendiente'){
            throw new Exception("No se pueden crear listas con nombres reservados. Por favor, elija otro nombre.");
        }
        if($this->listaModel->verificarNombreLista($usuario_id, $nombre)){
            throw new Exception("Ya existe una lista con ese nombre. Por favor, elija otro nombre para la lista.");
        }
        return $this->listaModel->crearLista($usuario_id, $nombre, $tipo_lista);
    }

    public function obtenerListasDeUsuario(int $usuario_id){
        return $this->listaModel->obtenerListasDeUsuario($usuario_id);
    }

    public function listaPerteneceAUsuario(int $lista_id, int $usuario_id): bool{
        return $this->listaModel->listaPerteneceAUsuario($lista_id, $usuario_id);
    }

    public function eliminarLista(int $id, int $usuario_id){
        return $this->listaModel->eliminarLista($id, $usuario_id);
    }

    public function editarLista(int $id, int $usuario_id, string $nuevo_nombre){
        if(empty($nuevo_nombre)){
            throw new Exception("Añada un nuevo para la lista. El nombre no puede estar vacío");            
        }
        if($nuevo_nombre === 'Viendo' || $nuevo_nombre === 'Completado' || $nuevo_nombre === 'Pendiente'){
            throw new Exception("No se pueden usar nombres reservados para las listas. Por favor, elija otro nombre.");
        }
        return $this->listaModel->editarLista($id, $usuario_id, $nuevo_nombre);

    }

    public function agregarContenidoALista(int $lista_id, int $contenido_id){
        if(empty($contenido_id)){
            throw new Exception("No has seleccionado ningún contenido. Por favor, seleccione un contenido para agregar a la lista.");
        }
        if($this->listaItemModel->verificarContenidoEnLista($lista_id, $contenido_id)){
            throw new Exception("El contenido ya se encuentra en la lista. No se pueden agregar contenidos duplicados.");
        }
        return $this->listaItemModel->agregarContenidoALista($lista_id, $contenido_id);
    }

    public function eliminarContenidoDeLista(int $lista_id, int $contenido_id){
        if(empty($contenido_id)){
            throw new Exception("No has seleccionado ningún contenido. Por favor, seleccione un contenido para eliminar de la lista.");
        }
        return $this->listaItemModel->eliminarContenidoDeLista($lista_id, $contenido_id);
    }

    public function obtenerContenidosDeLista(int $lista_id){
        return $this->listaItemModel->obtenerContenidosDeLista($lista_id);
    }
}