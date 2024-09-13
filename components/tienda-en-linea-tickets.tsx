'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Edit, Trash2, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from 'framer-motion'
import jsPDF from 'jspdf'

interface Producto {
  id: number
  nombre: string
  imagen: string
  descripcion: string
}

export function TiendaEnLineaTickets() {
  const [productos, setProductos] = useState<Producto[]>([
    { id: 1, nombre: "Chocolates", imagen: "/placeholder.svg?height=100&width=100", descripcion: "Chocolates bañados en almendras deliciosas" },
    { id: 2, nombre: "Agua Topochico", imagen: "/placeholder.svg?height=100&width=100", descripcion: "Refrescante sabor" },
    { id: 3, nombre: "Libro a decidir me puedes editar", imagen: "/placeholder.svg?height=100&width=100", descripcion: "Elige el libro que desees" },
    { id: 4, nombre: "Regalo sopresa", imagen: "/placeholder.svg?height=100&width=100", descripcion: "Eligeme" },
  ])
  const [carrito, setCarrito] = useState<Producto[]>([])
  const [nuevoProducto, setNuevoProducto] = useState<Omit<Producto, 'id'>>({ 
    nombre: "", 
    imagen: "", 
    descripcion: "" 
  })
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
  const [carritoModalAbierto, setCarritoModalAbierto] = useState(false)
  const [notificacion, setNotificacion] = useState('')

  useEffect(() => {
    if (notificacion) {
      const timer = setTimeout(() => setNotificacion(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [notificacion])

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito([...carrito, producto])
    setNotificacion(`${producto.nombre} agregado al carrito`)
  }

  const eliminarDelCarrito = (id: number) => {
    const productoEliminado = carrito.find(item => item.id === id)
    setCarrito(carrito.filter(item => item.id !== id))
    if (productoEliminado) {
      setNotificacion(`${productoEliminado.nombre} eliminado del carrito`)
    }
  }

  const agregarNuevoProducto = () => {
    if (nuevoProducto.nombre) {
      const nuevoId = Math.max(...productos.map(p => p.id), 0) + 1
      setProductos([...productos, { ...nuevoProducto, id: nuevoId }])
      setNuevoProducto({ nombre: "", imagen: "", descripcion: "" })
      setModalAbierto(false)
      setNotificacion('Nuevo producto agregado')
    }
  }

  const guardarEdicion = () => {
    if (productoEditando) {
      setProductos(productos.map(p => p.id === productoEditando.id ? productoEditando : p))
      setProductoEditando(null)
      setModalEditarAbierto(false)
      setNotificacion('Producto actualizado')
    }
  }

  const actualizarProductoEditando = (campo: keyof Producto, valor: string) => {
    if (productoEditando) {
      setProductoEditando({ ...productoEditando, [campo]: valor })
    }
  }

  const borrarProducto = (id: number) => {
    const productoEliminado = productos.find(p => p.id === id)
    setProductos(productos.filter(p => p.id !== id))
    setCarrito(carrito.filter(item => item.id !== id))
    if (productoEliminado) {
      setNotificacion(`${productoEliminado.nombre} eliminado`)
    }
  }

  const totalTickets = carrito.length

  const generarReciboPDF = () => {
    const doc = new jsPDF()
    let yPos = 20

    doc.setFontSize(20)
    doc.text('Recibo de Compra', 105, yPos, { align: 'center' })
    yPos += 10

    doc.setFontSize(12)
    carrito.forEach((item, index) => {
      yPos += 10
      doc.text(`${index + 1}. ${item.nombre} - 1 Ticket`, 20, yPos)
    })

    yPos += 20
    doc.setFontSize(16)
    doc.text(`Total: ${totalTickets} Ticket${totalTickets !== 1 ? 's' : ''}`, 20, yPos)

    doc.save('recibo.pdf')
    setCarritoModalAbierto(false)
    setCarrito([])
    setNotificacion('Recibo generado y carrito vaciado')
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Tienda de regalos</h1>
      <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">Feliz cumpleaños Angelita</h2>
      
      <div className="mb-6 flex justify-between items-center">
        <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-white text-black hover:bg-gray-100 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo regalo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-gray-100 text-black">
            <DialogHeader>
              <DialogTitle>Agregar opciones de regalo</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">Nombre</Label>
                <Input
                  id="nombre"
                  value={nuevoProducto.nombre}
                  onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imagen" className="text-right">Imagen URL</Label>
                <Input
                  id="imagen"
                  value={nuevoProducto.imagen}
                  onChange={(e) => setNuevoProducto({...nuevoProducto, imagen: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="descripcion" className="text-right">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={nuevoProducto.descripcion}
                  onChange={(e) => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={agregarNuevoProducto}>Agregar Regalo</Button>
          </DialogContent>
        </Dialog>
        <Button variant="outline" onClick={() => setCarritoModalAbierto(true)} className="bg-white text-black hover:bg-gray-100 transition-colors">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Ver Regalos ({carrito.length})
        </Button>
      </div>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence>
          {productos.map(producto => (
            <motion.div
              key={producto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="p-0">
                  <img src={producto.imagen} alt={producto.nombre} className="w-full h-48 object-cover" />
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle>{producto.nombre}</CardTitle>
                  <CardDescription className="text-lg font-semibold text-gray-700">1 Ticket</CardDescription>
                  <p className="mt-2 text-sm text-gray-600">{producto.descripcion}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center p-4 bg-gray-50">
                  <Button variant="outline" onClick={() => agregarAlCarrito(producto)} className="bg-white hover:bg-gray-100 transition-colors">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                  <div className="flex space-x-2">
                    <Dialog open={modalEditarAbierto} onOpenChange={setModalEditarAbierto}>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => setProductoEditando(producto)} className="bg-white hover:bg-gray-100 transition-colors">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-gray-200 text-black">
                        <DialogHeader>
                          <DialogTitle>Editar Regalo</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-nombre" className="text-right">Nombre</Label>
                            <Input
                              id="edit-nombre"
                              value={productoEditando?.nombre || ''}
                              onChange={(e) => actualizarProductoEditando('nombre', e.target.value)}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-imagen" className="text-right">Imagen URL</Label>
                            <Input
                              id="edit-imagen"
                              value={productoEditando?.imagen || ''}
                              onChange={(e) => actualizarProductoEditando('imagen', e.target.value)}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-descripcion" className="text-right">Descripción</Label>
                            <Textarea
                              id="edit-descripcion"
                              value={productoEditando?.descripcion || ''}
                              onChange={(e) => actualizarProductoEditando('descripcion', e.target.value)}
                              className="col-span-3"
                            />
                          </div>
                        </div>
                        <Button onClick={guardarEdicion}>Guardar Cambios</Button>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" onClick={() => borrarProducto(producto.id)} className="bg-white hover:bg-red-100 transition-colors">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <Dialog open={carritoModalAbierto} onOpenChange={setCarritoModalAbierto}>
        <DialogContent className="sm:max-w-[425px] bg-gray-200 text-black">
          <DialogHeader>
            <DialogTitle>Carrito de Regalos</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {carrito.length === 0 ? (
              <p>El carrito está vacío</p>
            ) : (
              <ul className="space-y-2">
                {carrito.map((item, index) => (
                  <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <img src={item.imagen} alt={item.nombre} className="w-12 h-12 object-cover rounded" />
                      <span>{item.nombre} - 1 Ticket</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => eliminarDelCarrito(item.id)}>
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-4">
            <div className="text-xl font-bold mb-4">
              Total: {totalTickets} Ticket{totalTickets !== 1 ? 's' : ''}
            </div>
            <Button onClick={generarReciboPDF} className="w-full" disabled={carrito.length === 0}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Tomame Foto
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {notificacion && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg"
          >
            {notificacion}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}